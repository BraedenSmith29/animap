package server

import (
	"net/http"

	handlers2 "github.com/braedensmith29/animap/server/handlers"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/health", handlers2.HandleGetHealth)
	mux.HandleFunc("/api/v1/fetchImage", handlers2.HandleFetchImage)
	return mux
}
