package auth

import (
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
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

	http.SetCookie(w, &http.Cookie{Name: "state", Value: "", Path: "/", MaxAge: -1})
	http.SetCookie(w, &http.Cookie{Name: "code_verifier", Value: "", Path: "/", MaxAge: -1})

	malClientId := os.Getenv("MAL_CLIENT_ID")
	if malClientId == "" {
		log.Println("MAL_CLIENT_ID environment variable is not set")
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	malClientSecret := os.Getenv("MAL_CLIENT_SECRET")
	if malClientSecret == "" {
		log.Println("MAL_CLIENT_SECRET environment variable is not set")
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	malRedirectUri := os.Getenv("MAL_REDIRECT_URI")
	if malRedirectUri == "" {
		log.Println("MAL_REDIRECT_URI environment variable is not set")
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	form := url.Values{}
	form.Set("client_id", malClientId)
	form.Set("client_secret", malClientSecret)
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", malRedirectUri)
	form.Set("code_verifier", codeVerifier.Value)
	response, err := http.PostForm(os.Getenv("MAL_BASE_URL")+"/v1/oauth2/token", form)
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
