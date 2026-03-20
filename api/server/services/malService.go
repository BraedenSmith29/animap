package services

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

var malHttpClient = &http.Client{
	Timeout: time.Second * 10,
}

func getMalRequest(requestUrl string) (*http.Request, error) {
	xMalClientId := os.Getenv("X_MAL_CLIENT_ID")
	if xMalClientId == "" {
		return nil, fmt.Errorf("X_MAL_CLIENT_ID not set")
	}

	// Create request object
	malRequest, err := http.NewRequest("GET", requestUrl, nil)
	if err != nil {
		return nil, err
	}
	malRequest.Header.Set("X-MAL-CLIENT-ID", xMalClientId)

	return malRequest, nil
}

func processMalRequestIntoJson(req *http.Request, v any) error {
	malResponse, err := malHttpClient.Do(req)
	if err != nil {
		return err
	}
	// Ensure body is closed after return
	defer func(Body io.ReadCloser) {
		cerr := Body.Close()
		if cerr != nil {
			log.Printf("warning: closing MAL response body failed: %v\n", cerr)
		}
	}(malResponse.Body)

	if malResponse.StatusCode != http.StatusOK {
		return fmt.Errorf("MAL API returned non-OK status: %d", malResponse.StatusCode)
	}

	err = json.NewDecoder(malResponse.Body).Decode(v)
	return err
}
