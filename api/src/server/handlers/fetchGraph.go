package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/braedensmith29/animap/src/server/services"
)

type FetchGraphResponse struct {
	Graph *services.AniMapGraph `json:"graph"`
}

func HandleFetchGraph(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	animeId := r.PathValue("animeId")
	if animeId == "" {
		http.Error(w, "animeId not specified", http.StatusBadRequest)
		return
	}
	_, err := strconv.Atoi(animeId)
	if err != nil {
		http.Error(w, "animeId must be an integer", http.StatusBadRequest)
		return
	}

	graph, err := services.GetAnimeGraph(animeId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := FetchGraphResponse{Graph: graph}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
