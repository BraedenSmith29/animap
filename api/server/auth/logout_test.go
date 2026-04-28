package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleLogout(t *testing.T) {
	t.Setenv("APP_ENV", "TEST")

	req := httptest.NewRequest("GET", "/auth/logout", nil)
	rr := httptest.NewRecorder()

	HandleLogout(rr, req)

	if status := rr.Code; status != http.StatusFound {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusFound)
	}

	expectedLocation := "/"
	if location := rr.Header().Get("Location"); location != expectedLocation {
		t.Errorf("handler returned wrong location: got %v want %v", location, expectedLocation)
	}

	cookies := rr.Result().Cookies()
	expectedCookies := map[string]struct {
		MaxAge int
		Path   string
	}{
		"refresh_token": {-1, "/auth/malRefresh"},
		"is_logged_in":  {-1, "/"},
	}

	for name, expected := range expectedCookies {
		found := false
		for _, cookie := range cookies {
			if cookie.Name == name {
				found = true
				if cookie.MaxAge != expected.MaxAge {
					t.Errorf("cookie %s has wrong MaxAge: got %v want %v", name, cookie.MaxAge, expected.MaxAge)
				}
				if cookie.Path != expected.Path {
					t.Errorf("cookie %s has wrong Path: got %v want %v", name, cookie.Path, expected.Path)
				}
				break
			}
		}
		if !found {
			t.Errorf("cookie %s not found in response", name)
		}
	}
}
