package handlers

import (
	"crypto/rand"
	"encoding/json"
	"math/big"
	"net/http"
)

type RandomNumberResponse struct {
	Number int `json:"number"`
}

func HandleGetRandomNumber(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	n, err := rand.Int(rand.Reader, big.NewInt(100))
	if err != nil {
		http.Error(w, "failed to generate random number", http.StatusInternalServerError)
		return
	}

	response := RandomNumberResponse{Number: int(n.Int64()) + 1}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
		return
	}
}
