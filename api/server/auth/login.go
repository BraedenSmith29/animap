package auth

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"os"
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		http.Error(w, "failed to generate code verifier", http.StatusInternalServerError)
		return
	}
	codeVerifier := base64.RawURLEncoding.EncodeToString(b)

	s := make([]byte, 16)
	_, err = rand.Read(s)
	if err != nil {
		http.Error(w, "failed to generate state", http.StatusInternalServerError)
		return
	}
	state := base64.RawURLEncoding.EncodeToString(s)

	codeChallenge := codeVerifier

	http.SetCookie(w, &http.Cookie{
		Name:     "code_verifier",
		Value:    codeVerifier,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("APP_ENV") == "PROD",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   5 * 60, // 5 minutes
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("APP_ENV") == "PROD",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   5 * 60, // 5 minutes
	})

	malTokenUrl, err := getMalTokenUrl(state, codeChallenge)
	if err != nil {
		http.Error(w, "failed to generate token URL", http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, malTokenUrl, http.StatusFound)
}

func getMalTokenUrl(state string, codeChallenge string) (string, error) {
	tokenUrl, err := url.Parse(os.Getenv("MAL_BASE_URL") + "/v1/oauth2/authorize")
	if err != nil {
		return "", err
	}

	malClientId := os.Getenv("MAL_CLIENT_ID")
	if malClientId == "" {
		return "", fmt.Errorf("MAL_CLIENT_ID environment variable is not set")
	}
	malRedirectUri := os.Getenv("MAL_REDIRECT_URI")
	if malRedirectUri == "" {
		return "", fmt.Errorf("MAL_REDIRECT_URI environment variable is not set")
	}

	params := url.Values{}
	params.Add("client_id", malClientId)
	params.Add("redirect_uri", malRedirectUri)
	params.Add("state", state)
	params.Add("code_challenge", codeChallenge)
	params.Add("code_challenge_method", "plain")
	params.Add("response_type", "code")

	tokenUrl.RawQuery = params.Encode()

	return tokenUrl.String(), nil
}
