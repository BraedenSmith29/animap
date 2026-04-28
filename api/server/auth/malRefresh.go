package auth

import (
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/braedensmith29/animap/server/env"
)

func HandleMalRefresh(w http.ResponseWriter, r *http.Request) {
	refreshTokenCookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "failed to get refresh_token cookie", http.StatusBadRequest)
		return
	}

	form := url.Values{}
	form.Set("client_id", env.MustGet("MAL_CLIENT_ID"))
	form.Set("client_secret", env.MustGet("MAL_CLIENT_SECRET"))
	form.Set("grant_type", "refresh_token")
	form.Set("refresh_token", refreshTokenCookie.Value)
	response, err := http.PostForm(env.MustGet("MAL_BASE_URL")+"/v1/oauth2/token", form)
	if err != nil {
		http.Error(w, "failed to exchange refresh token for an access token", http.StatusInternalServerError)
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
