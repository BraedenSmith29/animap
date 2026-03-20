package handlers

import (
	"errors"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	imageFetchTimeout = 10 * time.Second
	maxImageBytes     = 5 << 20 // 5 MiB
)

func HandleFetchImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	imageUrl := r.URL.Query().Get("imageUrl")
	if imageUrl == "" {
		http.Error(w, "imageUrl query parameter is required", http.StatusBadRequest)
		return
	}

	parsedURL, err := url.Parse(imageUrl)
	if err != nil || parsedURL == nil || parsedURL.Hostname() == "" {
		http.Error(w, "invalid imageUrl", http.StatusBadRequest)
		return
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		http.Error(w, "imageUrl must use http or https", http.StatusBadRequest)
		return
	}

	if !isAllowedMALHost(parsedURL.Hostname()) {
		http.Error(w, "imageUrl must be from myanimelist.net", http.StatusBadRequest)
		return
	}

	client := &http.Client{Timeout: imageFetchTimeout}
	resp, err := client.Get(parsedURL.String())
	if err != nil {
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			http.Error(w, "image fetch timed out", http.StatusGatewayTimeout)
			return
		}

		http.Error(w, "failed to fetch image", http.StatusInternalServerError)
		return
	}
	defer func(Body io.ReadCloser) {
		cerr := Body.Close()
		if cerr != nil {
			log.Printf("warning: closing response body failed: %v\n", cerr)
		}
	}(resp.Body)

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "failed to fetch image: "+resp.Status, http.StatusBadGateway)
		return
	}

	mediaType, _, err := mime.ParseMediaType(resp.Header.Get("Content-Type"))
	if err != nil || !strings.HasPrefix(strings.ToLower(mediaType), "image/") {
		http.Error(w, "fetched content is not an image", http.StatusBadGateway)
		return
	}

	// Copy content-type header from the fetched response
	if contentType := resp.Header.Get("Content-Type"); contentType != "" {
		w.Header().Set("Content-Type", contentType)
	}

	// Cap upstream response size to avoid unbounded reads.
	imageData, err := io.ReadAll(io.LimitReader(resp.Body, maxImageBytes+1))
	if err != nil {
		http.Error(w, "failed to read image data", http.StatusInternalServerError)
		return
	}
	if int64(len(imageData)) > maxImageBytes {
		http.Error(w, "fetched image is too large", http.StatusBadGateway)
		return
	}

	if _, err := w.Write(imageData); err != nil {
		http.Error(w, "failed to write image data", http.StatusInternalServerError)
		return
	}
}

func isAllowedMALHost(hostname string) bool {
	host := strings.ToLower(strings.TrimSuffix(hostname, "."))
	return host == "myanimelist.net" || strings.HasSuffix(host, ".myanimelist.net")
}
