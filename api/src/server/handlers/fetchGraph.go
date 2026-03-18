package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/braedensmith29/animap/src/server/services"
)

type FetchGraphResponse struct {
	Anime []services.Anime `json:"anime"`
	Edges []services.Edge  `json:"edges"`
}

func HandleFetchGraph(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	animeId, err := strconv.Atoi(r.PathValue("animeId"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	anime, edges, err := services.GetAnimeGraph(animeId, true)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := FetchGraphResponse{Anime: anime, Edges: edges}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
