package handlers

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleFetchImageValidation(t *testing.T) {
	tests := []struct {
		name       string
		method     string
		target     string
		statusCode int
	}{
		{
			name:       "rejects non get",
			method:     http.MethodPost,
			target:     "/api/v1/fetchImage?imageUrl=http://myanimelist.net/image.jpg",
			statusCode: http.StatusMethodNotAllowed,
		},
		{
			name:       "requires image url",
			method:     http.MethodGet,
			target:     "/api/v1/fetchImage",
			statusCode: http.StatusBadRequest,
		},
		{
			name:       "rejects invalid image url",
			method:     http.MethodGet,
			target:     "/api/v1/fetchImage?imageUrl=%3A%3A%3A",
			statusCode: http.StatusBadRequest,
		},
		{
			name:       "rejects unsupported scheme",
			method:     http.MethodGet,
			target:     "/api/v1/fetchImage?imageUrl=ftp://myanimelist.net/image.jpg",
			statusCode: http.StatusBadRequest,
		},
		{
			name:       "rejects disallowed host",
			method:     http.MethodGet,
			target:     "/api/v1/fetchImage?imageUrl=http://myanimelist.net.evil.com/image.jpg",
			statusCode: http.StatusBadRequest,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.target, nil)
			res := httptest.NewRecorder()

			HandleFetchImage(res, req)

			if res.Code != tc.statusCode {
				t.Fatalf("expected status %d, got %d", tc.statusCode, res.Code)
			}
		})
	}
}

func TestHandleFetchImageRejectsNonImageContent(t *testing.T) {
	configureDefaultTransportForTestServer(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host != "myanimelist.net" {
			t.Fatalf("expected upstream host %q, got %q", "myanimelist.net", r.Host)
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, err := io.WriteString(w, "not an image")
		if err != nil {
			t.Fatalf("failed to write upstream response: %v", err)
		}
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/fetchImage?imageUrl=http://myanimelist.net/poster.jpg", nil)
	res := httptest.NewRecorder()

	HandleFetchImage(res, req)

	if res.Code != http.StatusBadGateway {
		t.Fatalf("expected status %d, got %d", http.StatusBadGateway, res.Code)
	}
}

func TestHandleFetchImageReturnsImageFromAllowedSubdomain(t *testing.T) {
	configureDefaultTransportForTestServer(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host != "cdn.myanimelist.net" {
			t.Fatalf("expected upstream host %q, got %q", "cdn.myanimelist.net", r.Host)
		}

		w.Header().Set("Content-Type", "image/png")
		w.WriteHeader(http.StatusOK)
		_, err := io.WriteString(w, "png-data")
		if err != nil {
			t.Fatalf("failed to write upstream response: %v", err)
		}
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/fetchImage?imageUrl=http://cdn.myanimelist.net/poster.png", nil)
	res := httptest.NewRecorder()

	HandleFetchImage(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, res.Code)
	}

	if contentType := res.Header().Get("Content-Type"); contentType != "image/png" {
		t.Fatalf("expected content-type %q, got %q", "image/png", contentType)
	}

	if body := res.Body.String(); body != "png-data" {
		t.Fatalf("expected body %q, got %q", "png-data", body)
	}
}

func configureDefaultTransportForTestServer(t *testing.T, handler http.Handler) {
	t.Helper()

	server := httptest.NewServer(handler)
	baseTransport, ok := http.DefaultTransport.(*http.Transport)
	if !ok {
		server.Close()
		t.Fatalf("expected default transport to be *http.Transport")
	}

	originalTransport := http.DefaultTransport
	transport := baseTransport.Clone()
	dialer := &net.Dialer{}

	transport.DialContext = func(ctx context.Context, network, addr string) (net.Conn, error) {
		switch addr {
		case "myanimelist.net:80", "cdn.myanimelist.net:80":
			return dialer.DialContext(ctx, network, server.Listener.Addr().String())
		default:
			return dialer.DialContext(ctx, network, addr)
		}
	}

	http.DefaultTransport = transport

	t.Cleanup(func() {
		http.DefaultTransport = originalTransport
		server.Close()
	})
}
