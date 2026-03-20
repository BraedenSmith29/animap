package handlers

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleFetchGraph(t *testing.T) {
	configureMockMALAPI(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v2/anime/52991":
			_, _ = w.Write([]byte(`{"id":52991,"title":"Sousou no Frieren","num_list_users":1,"media_type":"tv","status":"finished_airing","num_episodes":28,"related_anime":[]}`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/fetchGraph/52991", nil)
	req.SetPathValue("animeId", "52991")
	res := httptest.NewRecorder()
	HandleFetchGraph(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, res.Code)
	}

	var payload FetchGraphResponse
	if err := json.NewDecoder(res.Body).Decode(&payload); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if payload.Graph == nil || len(payload.Graph.Nodes) != 1 {
		t.Fatalf("expected graph response with one node")
	}
}

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

func TestHandleFetchGraphReturnsServerErrorWhenMALFails(t *testing.T) {
	configureMockMALAPI(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadGateway)
		_, _ = w.Write([]byte(`{"error":"upstream failure"}`))
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/fetchGraph/52991", nil)
	req.SetPathValue("animeId", "52991")
	res := httptest.NewRecorder()
	HandleFetchGraph(res, req)

	if res.Code != http.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", http.StatusInternalServerError, res.Code)
	}
}

func configureMockMALAPI(t *testing.T, handler http.Handler) {
	t.Helper()

	server := httptest.NewTLSServer(handler)
	baseTransport, ok := http.DefaultTransport.(*http.Transport)
	if !ok {
		server.Close()
		t.Fatalf("expected default transport to be *http.Transport")
	}

	originalTransport := http.DefaultTransport
	transport := baseTransport.Clone()
	transport.TLSClientConfig = &tls.Config{InsecureSkipVerify: true} //nolint:gosec // Test-only transport.
	dialer := &net.Dialer{}

	transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		switch addr {
		case "api.myanimelist.net:443", "api.myanimelist.net:80":
			return dialer.DialContext(ctx, network, server.Listener.Addr().String())
		default:
			return dialer.DialContext(ctx, network, addr)
		}
	}

	http.DefaultTransport = transport
	t.Setenv("X_MAL_CLIENT_ID", "testutils-client-id")

	t.Cleanup(func() {
		http.DefaultTransport = originalTransport
		server.Close()
	})
}
