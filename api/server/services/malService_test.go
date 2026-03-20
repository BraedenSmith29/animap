package services

import (
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestGetMalRequest(t *testing.T) {
	t.Run("returns error when client id is missing", func(t *testing.T) {
		t.Setenv("X_MAL_CLIENT_ID", "")

		req, err := getMalRequest("https://api.myanimelist.net/v2/anime/1")
		if err == nil {
			t.Fatalf("expected an error, got nil")
		}
		if req != nil {
			t.Fatalf("expected nil request when env var is missing")
		}
	})

	t.Run("builds request with auth header", func(t *testing.T) {
		t.Setenv("X_MAL_CLIENT_ID", "testutils-client-id")

		req, err := getMalRequest("https://api.myanimelist.net/v2/anime/1")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if req.Method != http.MethodGet {
			t.Fatalf("expected method %q, got %q", http.MethodGet, req.Method)
		}
		if req.URL.String() != "https://api.myanimelist.net/v2/anime/1" {
			t.Fatalf("unexpected request url: %q", req.URL.String())
		}
		if header := req.Header.Get("X-MAL-CLIENT-ID"); header != "testutils-client-id" {
			t.Fatalf("expected X-MAL-CLIENT-ID header to be set")
		}
	})
}

type trackingReadCloser struct {
	Reader io.Reader
	closed bool
}

func (trc *trackingReadCloser) Read(p []byte) (int, error) {
	return trc.Reader.Read(p)
}
func (trc *trackingReadCloser) Close() error {
	trc.closed = true
	return nil
}

func TestProcessMalRequestIntoJson(t *testing.T) {
	t.Run("returns transport error", func(t *testing.T) {
		wantErr := errors.New("upstream unavailable")
		restore := useMockedMALHTTPClient(t, func(_ *http.Request) (*http.Response, error) {
			return nil, wantErr
		})
		t.Cleanup(restore)

		req, err := http.NewRequest(http.MethodGet, "https://api.myanimelist.net/v2/anime/1", nil)
		if err != nil {
			t.Fatalf("failed to build request: %v", err)
		}
		var decoded struct{}
		err = processMalRequestIntoJson(req, &decoded)
		if !errors.Is(err, wantErr) {
			t.Fatalf("expected error %v, got %v", wantErr, err)
		}
	})

	t.Run("returns error on non 200 status and closes body", func(t *testing.T) {
		body := &trackingReadCloser{Reader: strings.NewReader(`{"error":"bad request"}`)}
		restore := useMockedMALHTTPClient(t, func(_ *http.Request) (*http.Response, error) {
			return &http.Response{StatusCode: http.StatusBadGateway, Body: body}, nil
		})
		t.Cleanup(restore)

		req, err := http.NewRequest(http.MethodGet, "https://api.myanimelist.net/v2/anime/1", nil)
		if err != nil {
			t.Fatalf("failed to build request: %v", err)
		}
		var decoded struct{}
		err = processMalRequestIntoJson(req, &decoded)
		if err == nil {
			t.Fatalf("expected non-OK error, got nil")
		}
		if !body.closed {
			t.Fatalf("expected response body to be closed")
		}
	})

	t.Run("returns decode error for invalid json", func(t *testing.T) {
		restore := useMockedMALHTTPClient(t, func(_ *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader("not-json")),
			}, nil
		})
		t.Cleanup(restore)

		req, err := http.NewRequest(http.MethodGet, "https://api.myanimelist.net/v2/anime/1", nil)
		if err != nil {
			t.Fatalf("failed to build request: %v", err)
		}
		var decoded struct{}
		err = processMalRequestIntoJson(req, &decoded)
		if err == nil {
			t.Fatalf("expected decode error, got nil")
		}
	})

	t.Run("decodes response body", func(t *testing.T) {
		restore := useMockedMALHTTPClient(t, func(_ *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"value":"ok"}`)),
			}, nil
		})
		t.Cleanup(restore)

		req, err := http.NewRequest(http.MethodGet, "https://api.myanimelist.net/v2/anime/1", nil)
		if err != nil {
			t.Fatalf("failed to build request: %v", err)
		}
		var decoded struct {
			Value string `json:"value"`
		}
		err = processMalRequestIntoJson(req, &decoded)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if decoded.Value != "ok" {
			t.Fatalf("expected decoded value %q, got %q", "ok", decoded.Value)
		}
	})
}
