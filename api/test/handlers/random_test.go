package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/braedensmith29/animap/src/server/handlers"
)

func TestHandleGetRandomNumberReturnsInRange(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/numbers/random", nil)
	res := httptest.NewRecorder()

	handlers.HandleGetRandomNumber(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, res.Code)
	}

	var payload handlers.RandomNumberResponse
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if payload.Number < 1 || payload.Number > 100 {
		t.Fatalf("expected number to be between 1 and 100, got %d", payload.Number)
	}
}

func TestHandleGetRandomNumberRejectsNonGet(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/v1/numbers/random", nil)
	res := httptest.NewRecorder()

	handlers.HandleGetRandomNumber(res, req)

	if res.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status %d, got %d", http.StatusMethodNotAllowed, res.Code)
	}
}
