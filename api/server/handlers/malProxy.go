package handlers

import (
	"errors"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	proxyTimeout         = 10 * time.Second
	maxResponseBodyBytes = 10 << 20 // 10 MiB
)

var client = &http.Client{Timeout: proxyTimeout}

func HandleMalProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	targetUrl := r.URL.Query().Get("url")
	if targetUrl == "" {
		http.Error(w, "url query parameter is required", http.StatusBadRequest)
		return
	}

	parsedURL, err := url.Parse(targetUrl)
	if err != nil || parsedURL == nil || parsedURL.Hostname() == "" {
		http.Error(w, "invalid url", http.StatusBadRequest)
		return
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		http.Error(w, "url must use http or https", http.StatusBadRequest)
		return
	}

	if !isAllowedMALHost(parsedURL.Hostname()) {
		http.Error(w, "url must be from myanimelist.net", http.StatusBadRequest)
		return
	}

	req, err := http.NewRequest(http.MethodGet, parsedURL.String(), nil)
	if err != nil {
		http.Error(w, "failed to create the proxy request", http.StatusInternalServerError)
		return
	}

	// Try to get access token from header
	if accessTokenCookie := r.Header.Get("Authorization"); accessTokenCookie != "" {
		req.Header.Set("Authorization", accessTokenCookie)
	}

	resp, err := client.Do(req)
	if err != nil {
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			http.Error(w, "proxy request timed out", http.StatusGatewayTimeout)
			return
		}

		http.Error(w, "failed to proxy request", http.StatusInternalServerError)
		return
	}
	defer func(Body io.ReadCloser) {
		cerr := Body.Close()
		if cerr != nil {
			log.Printf("warning: closing response body failed: %v\n", cerr)
		}
	}(resp.Body)

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "upstream returned error: "+resp.Status, http.StatusBadGateway)
		return
	}

	// Copy content-type header from the fetched response
	if contentType := resp.Header.Get("Content-Type"); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	}
	// Copy cache-control header from the fetched response
	if cacheControl := resp.Header.Get("Cache-Control"); cacheControl != "" {
		w.Header().Set("Cache-Control", cacheControl)
	}

	// Cap upstream response size to avoid unbounded reads.
	data, err := io.ReadAll(io.LimitReader(resp.Body, maxResponseBodyBytes+1))
	if err != nil {
		http.Error(w, "failed to read response data", http.StatusInternalServerError)
		return
	}
	if int64(len(data)) > maxResponseBodyBytes {
		http.Error(w, "upstream response is too large", http.StatusBadGateway)
		return
	}

	if _, err := w.Write(data); err != nil {
		http.Error(w, "failed to write response data", http.StatusInternalServerError)
		return
	}
}

func isAllowedMALHost(hostname string) bool {
	host := strings.ToLower(strings.TrimSuffix(hostname, "."))
	return host == "myanimelist.net" || strings.HasSuffix(host, ".myanimelist.net")
}
