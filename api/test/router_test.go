package test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/braedensmith29/animap/src"
)

func TestRoutes(t *testing.T) {
	router := src.NewRouter()

	healthReq := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	healthRes := httptest.NewRecorder()
	router.ServeHTTP(healthRes, healthReq)
	if healthRes.Code != http.StatusOK {
		t.Fatalf("expected health route status %d, got %d", http.StatusOK, healthRes.Code)
	}

	randomReq := httptest.NewRequest(http.MethodGet, "/api/v1/random", nil)
	randomRes := httptest.NewRecorder()
	router.ServeHTTP(randomRes, randomReq)
	if randomRes.Code != http.StatusOK {
		t.Fatalf("expected random route status %d, got %d", http.StatusOK, randomRes.Code)
	}
}
