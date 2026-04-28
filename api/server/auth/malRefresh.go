package auth

import (
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

func HandleMalRefresh(w http.ResponseWriter, r *http.Request) {
	refreshTokenCookie, err := r.Cookie("refresh_token")
	if err != nil {
		http.Error(w, "failed to get refresh_token cookie", http.StatusBadRequest)
		return
	}

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

	form := url.Values{}
	form.Set("client_id", malClientId)
	form.Set("client_secret", malClientSecret)
	form.Set("grant_type", "refresh_token")
	form.Set("refresh_token", refreshTokenCookie.Value)
	response, err := http.PostForm(os.Getenv("MAL_BASE_URL")+"/v1/oauth2/token", form)
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
