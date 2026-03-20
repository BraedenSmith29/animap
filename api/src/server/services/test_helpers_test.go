package services

import (
	"net/http"
	"testing"
)

type roundTripFunc func(req *http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func useMockedMALHTTPClient(t *testing.T, rt roundTripFunc) func() {
	t.Helper()
	originalClient := malHttpClient
	malHttpClient = &http.Client{Transport: rt}
	return func() {
		malHttpClient = originalClient
	}
}
