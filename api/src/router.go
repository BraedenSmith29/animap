package src

import (
	"net/http"

	"github.com/braedensmith29/animap/src/handlers"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/health", handlers.HandleGetHealth)
	mux.HandleFunc("/api/v1/random", handlers.HandleGetRandomNumber)
	return mux
}
