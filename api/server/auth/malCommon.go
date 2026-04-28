package auth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type MalTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

func handleMalTokenResponse(w http.ResponseWriter, response *http.Response) {
	if response.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("MAL API returned non-OK status: %d", response.StatusCode), http.StatusInternalServerError)
		return
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		http.Error(w, "failed to read MAL response", http.StatusInternalServerError)
		return
	}

	var tokenResp MalTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		http.Error(w, "failed to parse MAL response", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokenResp.RefreshToken,
		Path:     "/auth/malRefresh",
		HttpOnly: true,
		Secure:   os.Getenv("APP_ENV") == "PROD",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   31 * 24 * 60 * 60, // 31 days
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "is_logged_in",
		Value:    "true",
		Path:     "/",
		HttpOnly: false,
		Secure:   os.Getenv("APP_ENV") == "PROD",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   31 * 24 * 60 * 60, // 31 days
	})

	err = json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token": tokenResp.AccessToken,
		"expires_in":   tokenResp.ExpiresIn,
	})
	if err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
