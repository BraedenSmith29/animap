package auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestHandleMalRefresh(t *testing.T) {
	os.Setenv("MAL_CLIENT_ID", "test_client_id")
	os.Setenv("MAL_CLIENT_SECRET", "test_client_secret")
	defer os.Unsetenv("MAL_CLIENT_ID")
	defer os.Unsetenv("MAL_CLIENT_SECRET")

	// Mock MAL server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/oauth2/token" {
			t.Errorf("wrong path: %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("wrong method: %s", r.Method)
		}

		err := r.ParseForm()
		if err != nil {
			t.Errorf("failed to parse form: %v", err)
		}
		if r.Form.Get("grant_type") != "refresh_token" {
			t.Errorf("wrong grant_type: %s", r.Form.Get("grant_type"))
		}
		if r.Form.Get("refresh_token") != "old_refresh_token" {
			t.Errorf("wrong refresh_token: %s", r.Form.Get("refresh_token"))
		}

		w.Header().Set("Content-Type", "application/json")
		tokenResponse := MalTokenResponse{
			AccessToken:  "new_access_token",
			RefreshToken: "new_refresh_token",
			ExpiresIn:    3600,
			TokenType:    "Bearer",
		}
		json.NewEncoder(w).Encode(tokenResponse)
	}))
	defer ts.Close()

	os.Setenv("MAL_BASE_URL", ts.URL)
	defer os.Unsetenv("MAL_BASE_URL")

	req := httptest.NewRequest("POST", "/auth/malRefresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh_token", Value: "old_refresh_token"})
	rr := httptest.NewRecorder()

	HandleMalRefresh(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rr.Code)
	}

	var respBody map[string]interface{}
	err := json.NewDecoder(rr.Body).Decode(&respBody)
	if err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}

	if respBody["access_token"] != "new_access_token" {
		t.Errorf("wrong access_token: %v", respBody["access_token"])
	}
}

func TestHandleMalRefresh_NoCookie(t *testing.T) {
	req := httptest.NewRequest("POST", "/auth/malRefresh", nil)
	rr := httptest.NewRecorder()

	HandleMalRefresh(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rr.Code)
	}
}
