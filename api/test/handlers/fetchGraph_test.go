package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/braedensmith29/animap/src/server"
	"github.com/braedensmith29/animap/src/server/handlers"
	"github.com/joho/godotenv"
)

func TestHandleFetchGraph(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		fmt.Println(err)
		t.Fatalf("Error loading .env file. Ensure you are running from /api.")
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/fetchGraph/52991", nil)
	res := httptest.NewRecorder()

	router := server.NewRouter()
	router.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, res.Code)
	}

	var payload handlers.FetchGraphResponse
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if payload.Anime == nil || payload.Edges == nil {
		t.Fatalf("malformatted payload %#v", payload)
	}
}

func TestHandleFetchGraphRejectsNonGet(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		fmt.Println(err)
		t.Fatalf("Error loading .env file. Ensure you are running from /api.")
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/fetchGraph/52991", nil)
	res := httptest.NewRecorder()

	router := server.NewRouter()
	router.ServeHTTP(res, req)

	if res.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status %d, got %d", http.StatusMethodNotAllowed, res.Code)
	}
}
