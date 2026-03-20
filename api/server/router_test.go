package server

import (
	"context"
	"crypto/tls"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRoutes(t *testing.T) {
	configureMockMALAPIForRouter(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte(`{"id":52991,"title":"Mocked","num_list_users":0,"media_type":"tv","status":"finished_airing","num_episodes":1,"related_anime":[]}`))
	}))

	router := NewRouter()

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

func TestUnknownRouteReturnsNotFound(t *testing.T) {
	router := NewRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/does-not-exist", nil)
	res := httptest.NewRecorder()

	router.ServeHTTP(res, req)

	if res.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, res.Code)
	}
}

func configureMockMALAPIForRouter(t *testing.T, handler http.Handler) {
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
