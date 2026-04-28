package auth

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func TestHandleMalTokenResponse(t *testing.T) {
	os.Setenv("APP_ENV", "LOCAL")
	defer os.Unsetenv("APP_ENV")

	w := httptest.NewRecorder()
	tokenResponse := MalTokenResponse{
		AccessToken:  "access_123",
		RefreshToken: "refresh_456",
		ExpiresIn:    3600,
		TokenType:    "Bearer",
	}
	body, _ := json.Marshal(tokenResponse)
	response := &http.Response{
		StatusCode: http.StatusOK,
		Body:       io.NopCloser(strings.NewReader(string(body))),
	}

	handleMalTokenResponse(w, response)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	cookies := w.Result().Cookies()
	hasRefreshToken := false
	hasIsLoggedIn := false
	for _, cookie := range cookies {
		if cookie.Name == "refresh_token" {
			hasRefreshToken = true
			if cookie.Value != "refresh_456" {
				t.Errorf("wrong refresh_token value: %s", cookie.Value)
			}
			if cookie.Path != "/auth/malRefresh" {
				t.Errorf("wrong refresh_token path: %s", cookie.Path)
			}
			if cookie.Secure {
				t.Errorf("refresh_token should not be secure in DEV")
			}
		}
		if cookie.Name == "is_logged_in" {
			hasIsLoggedIn = true
			if cookie.Value != "true" {
				t.Errorf("wrong is_logged_in value: %s", cookie.Value)
			}
		}
	}

	if !hasRefreshToken {
		t.Error("refresh_token cookie missing")
	}
	if !hasIsLoggedIn {
		t.Error("is_logged_in cookie missing")
	}

	var respBody map[string]interface{}
	err := json.NewDecoder(w.Body).Decode(&respBody)
	if err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}

	if respBody["access_token"] != "access_123" {
		t.Errorf("wrong access_token in body: %v", respBody["access_token"])
	}
	if int(respBody["expires_in"].(float64)) != 3600 {
		t.Errorf("wrong expires_in in body: %v", respBody["expires_in"])
	}
}

func TestHandleMalTokenResponse_Error(t *testing.T) {
	w := httptest.NewRecorder()
	response := &http.Response{
		StatusCode: http.StatusBadRequest,
		Body:       io.NopCloser(strings.NewReader("error")),
	}

	handleMalTokenResponse(w, response)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status 500, got %d", w.Code)
	}
}
