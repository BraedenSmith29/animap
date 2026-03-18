package test

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/braedensmith29/animap/src/server"
	"github.com/joho/godotenv"
)

func TestRoutes(t *testing.T) {
	err := godotenv.Load("../.env")
	if err != nil {
		fmt.Println(err)
		t.Fatalf("Error loading .env file. Ensure you are running from /api.")
	}

	router := server.NewRouter()

	healthReq := httptest.NewRequest(http.MethodGet, "/api/v1/health", nil)
	healthRes := httptest.NewRecorder()
	router.ServeHTTP(healthRes, healthReq)
	if healthRes.Code != http.StatusOK {
		t.Fatalf("expected health route status %d, got %d", http.StatusOK, healthRes.Code)
	}

	fetchGraphReq := httptest.NewRequest(http.MethodGet, "/api/v1/fetchGraph/52991", nil)
	fetchGraphRes := httptest.NewRecorder()
	router.ServeHTTP(fetchGraphRes, fetchGraphReq)
	if fetchGraphRes.Code != http.StatusOK {
		t.Fatalf("expected fetchGraph route status %d, got %d", http.StatusOK, fetchGraphRes.Code)
	}
}
