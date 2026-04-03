package server

import (
	"net/http"

	"github.com/braedensmith29/animap/server/handlers"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/health", handlers.HandleGetHealth)
	mux.HandleFunc("/api/v1/fetchImage", handlers.HandleFetchImage)
	return mux
}
