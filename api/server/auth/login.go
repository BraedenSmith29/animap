package auth

import (
	"crypto/rand"
	"encoding/base64"
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

	http.SetCookie(w, &http.Cookie{Name: "code_verifier", Value: codeVerifier, Path: "/", HttpOnly: true, SameSite: http.SameSiteLaxMode})
	http.SetCookie(w, &http.Cookie{Name: "state", Value: state, Path: "/", HttpOnly: true, SameSite: http.SameSiteLaxMode})
	http.Redirect(w, r, getMalTokenUrl(state, codeChallenge), http.StatusFound)
}

func getMalTokenUrl(state string, codeChallenge string) string {
	tokenUrl, _ := url.Parse("https://myanimelist.net/v1/oauth2/authorize")

	params := url.Values{}
	params.Add("client_id", os.Getenv("MAL_CLIENT_ID"))
	params.Add("redirect_uri", os.Getenv("MAL_REDIRECT_URI"))
	params.Add("state", state)
	params.Add("code_challenge", codeChallenge)
	params.Add("code_challenge_method", "plain")
	params.Add("response_type", "code")

	tokenUrl.RawQuery = params.Encode()

	return tokenUrl.String()
}
