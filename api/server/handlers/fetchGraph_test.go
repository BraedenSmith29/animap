package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleFetchGraphRejectsNonGet(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/api/v1/fetchGraph/52991", nil)
	req.SetPathValue("animeId", "52991")
	res := httptest.NewRecorder()
	HandleFetchGraph(res, req)

	if res.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status %d, got %d", http.StatusMethodNotAllowed, res.Code)
	}
}

func TestHandleFetchGraphRejectsNonIntegerAnimeID(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/fetchGraph/not-a-number", nil)
	req.SetPathValue("animeId", "not-a-number")
	res := httptest.NewRecorder()
	HandleFetchGraph(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status %d, got %d", http.StatusBadRequest, res.Code)
	}
}
