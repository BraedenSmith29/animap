package auth

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
)

func TestHandleLogin(t *testing.T) {
	t.Setenv("APP_ENV", "TEST")
	t.Setenv("MAL_BASE_URL", "https://myanimelist.net")
	t.Setenv("MAL_CLIENT_ID", "test_client_id")
	t.Setenv("MAL_REDIRECT_URI", "http://localhost:3000/callback")

	req := httptest.NewRequest("GET", "/auth/login", nil)
	rr := httptest.NewRecorder()

	HandleLogin(rr, req)

	if status := rr.Code; status != http.StatusFound {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusFound)
	}

	location := rr.Header().Get("Location")
	u, err := url.Parse(location)
	if err != nil {
		t.Fatalf("failed to parse redirect location: %v", err)
	}

	if u.Host != "myanimelist.net" {
		t.Errorf("wrong host in redirect: got %v want %v", u.Host, "myanimelist.net")
	}

	q := u.Query()
	if q.Get("client_id") != "test_client_id" {
		t.Errorf("wrong client_id: got %v want %v", q.Get("client_id"), "test_client_id")
	}
	if q.Get("redirect_uri") != "http://localhost:3000/callback" {
		t.Errorf("wrong redirect_uri: got %v want %v", q.Get("redirect_uri"), "http://localhost:3000/callback")
	}
	if q.Get("response_type") != "code" {
		t.Errorf("wrong response_type: got %v want %v", q.Get("response_type"), "code")
	}
	if q.Get("code_challenge_method") != "plain" {
		t.Errorf("wrong code_challenge_method: got %v want %v", q.Get("code_challenge_method"), "plain")
	}

	cookies := rr.Result().Cookies()
	expectedCookies := []string{"code_verifier", "state"}
	for _, name := range expectedCookies {
		found := false
		for _, cookie := range cookies {
			if cookie.Name == name {
				found = true
				if cookie.Value == "" {
					t.Errorf("cookie %s is empty", name)
				}
				if !cookie.HttpOnly {
					t.Errorf("cookie %s should be HttpOnly", name)
				}
				break
			}
		}
		if !found {
			t.Errorf("cookie %s not found in response", name)
		}
	}
}
