package auth

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestHandleMalTokenFromCode(t *testing.T) {
	os.Setenv("MAL_CLIENT_ID", "test_client_id")
	os.Setenv("MAL_CLIENT_SECRET", "test_client_secret")
	os.Setenv("MAL_REDIRECT_URI", "test_redirect_uri")
	defer os.Unsetenv("MAL_CLIENT_ID")
	defer os.Unsetenv("MAL_CLIENT_SECRET")
	defer os.Unsetenv("MAL_REDIRECT_URI")

	// Mock MAL server
	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/oauth2/token" {
			t.Errorf("wrong path: %s", r.URL.Path)
		}

		err := r.ParseForm()
		if err != nil {
			t.Errorf("failed to parse form: %v", err)
		}
		if r.Form.Get("grant_type") != "authorization_code" {
			t.Errorf("wrong grant_type: %s", r.Form.Get("grant_type"))
		}
		if r.Form.Get("code") != "test_code" {
			t.Errorf("wrong code: %s", r.Form.Get("code"))
		}
		if r.Form.Get("code_verifier") != "test_verifier" {
			t.Errorf("wrong code_verifier: %s", r.Form.Get("code_verifier"))
		}

		w.Header().Set("Content-Type", "application/json")
		tokenResponse := MalTokenResponse{
			AccessToken:  "access_token_123",
			RefreshToken: "refresh_token_456",
			ExpiresIn:    3600,
			TokenType:    "Bearer",
		}
		json.NewEncoder(w).Encode(tokenResponse)
	}))
	defer ts.Close()

	os.Setenv("MAL_BASE_URL", ts.URL)
	defer os.Unsetenv("MAL_BASE_URL")

	req := httptest.NewRequest("GET", "/auth/callback?code=test_code&state=test_state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "test_state"})
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "test_verifier"})
	rr := httptest.NewRecorder()

	HandleMalTokenFromCode(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rr.Code)
	}

	// Verify cookies are cleared
	cookies := rr.Result().Cookies()
	stateCleared := false
	verifierCleared := false
	for _, cookie := range cookies {
		if cookie.Name == "state" && cookie.MaxAge == -1 {
			stateCleared = true
		}
		if cookie.Name == "code_verifier" && cookie.MaxAge == -1 {
			verifierCleared = true
		}
	}
	if !stateCleared {
		t.Error("state cookie not cleared")
	}
	if !verifierCleared {
		t.Error("code_verifier cookie not cleared")
	}

	var respBody map[string]interface{}
	err := json.NewDecoder(rr.Body).Decode(&respBody)
	if err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	if respBody["access_token"] != "access_token_123" {
		t.Errorf("wrong access_token: %v", respBody["access_token"])
	}
}

func TestHandleMalTokenFromCode_StateMismatch(t *testing.T) {
	req := httptest.NewRequest("GET", "/auth/callback?code=test_code&state=wrong_state", nil)
	req.AddCookie(&http.Cookie{Name: "state", Value: "test_state"})
	req.AddCookie(&http.Cookie{Name: "code_verifier", Value: "test_verifier"})
	rr := httptest.NewRecorder()

	HandleMalTokenFromCode(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", rr.Code)
	}
}
