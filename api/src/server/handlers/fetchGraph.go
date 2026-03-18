package handlers

import (
	"io"
	"net/http"
	"os"
)

func HandleFetchGraph(w http.ResponseWriter, r *http.Request) {
	// Make a request to the MyAnimeList API to fetch the anime graph data
	malRequest, err := http.NewRequest("GET", "https://api.myanimelist.net/v2/anime/30230?fields=id,title,main_picture,alternative_titles,related_anime,related_manga", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	malRequest.Header.Set("X-MAL-CLIENT-ID", os.Getenv("X_MAL_CLIENT_ID"))
	malResponse, err := http.DefaultClient.Do(malRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Ensure body is closed after return
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}(malResponse.Body)

	// Parrot the response from MyAnimeList back to the client
	w.Header().Set("Content-Type", malResponse.Header.Get("Content-Type"))
	_, err = io.Copy(w, malResponse.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
