package handlers

import (
	"io"
	"log"
	"mime"
	"net/http"
	"net/url"
	"strings"
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

	// Fetch the image from the provided URL
	resp, err := http.Get(parsedURL.String())
	if err != nil {
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

	// Copy the image data to the response writer
	if _, err := io.Copy(w, resp.Body); err != nil {
		http.Error(w, "failed to write image data", http.StatusInternalServerError)
		return
	}
}

func isAllowedMALHost(hostname string) bool {
	host := strings.ToLower(strings.TrimSuffix(hostname, "."))
	return host == "myanimelist.net" || strings.HasSuffix(host, ".myanimelist.net")
}

