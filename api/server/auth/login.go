package auth

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"net/url"

	"github.com/braedensmith29/animap/server/env"
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
		Secure:   env.IsProd(),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   5 * 60, // 5 minutes
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   env.IsProd(),
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
	tokenUrl, err := url.Parse(env.MustGet("MAL_BASE_URL") + "/v1/oauth2/authorize")
	if err != nil {
		return "", err
	}

	params := url.Values{}
	params.Add("client_id", env.MustGet("MAL_CLIENT_ID"))
	params.Add("redirect_uri", env.MustGet("MAL_REDIRECT_URI"))
	params.Add("state", state)
	params.Add("code_challenge", codeChallenge)
	params.Add("code_challenge_method", "plain")
	params.Add("response_type", "code")

	tokenUrl.RawQuery = params.Encode()

	return tokenUrl.String(), nil
}
