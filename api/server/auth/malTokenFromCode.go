package auth

import (
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/braedensmith29/animap/server/env"
)

func HandleMalTokenFromCode(w http.ResponseWriter, r *http.Request) {
	stateCookie, err := r.Cookie("state")
	if err != nil {
		http.Error(w, "failed to get state cookie", http.StatusBadRequest)
		return
	}
	codeVerifier, err := r.Cookie("code_verifier")
	if err != nil {
		http.Error(w, "failed to get code verifier cookie", http.StatusBadRequest)
		return
	}
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "failed to get query parameter: code", http.StatusBadRequest)
		return
	}
	state := r.URL.Query().Get("state")
	if state == "" {
		http.Error(w, "failed to get query parameter: state", http.StatusBadRequest)
		return
	}

	if state != stateCookie.Value {
		http.Error(w, "state mismatch", http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "code_verifier",
		Value:  "",
		Path:   "/",
		Secure: env.IsProd(),
		MaxAge: -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:   "state",
		Value:  "",
		Path:   "/",
		Secure: env.IsProd(),
		MaxAge: -1,
	})

	form := url.Values{}
	form.Set("client_id", env.MustGet("MAL_CLIENT_ID"))
	form.Set("client_secret", env.MustGet("MAL_CLIENT_SECRET"))
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", env.MustGet("MAL_REDIRECT_URI"))
	form.Set("code_verifier", codeVerifier.Value)
	response, err := http.PostForm(env.MustGet("MAL_BASE_URL")+"/v1/oauth2/token", form)
	if err != nil {
		http.Error(w, "failed to exchange code for an access token", http.StatusInternalServerError)
		return
	}
	defer func(Body io.ReadCloser) {
		cerr := Body.Close()
		if cerr != nil {
			log.Printf("warning: closing MAL response body failed: %v\n", cerr)
		}
	}(response.Body)

	handleMalTokenResponse(w, response)
}
