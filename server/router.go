package server

import (
	"net/http"

	"github.com/braedensmith29/animap/server/auth"
	"github.com/braedensmith29/animap/server/handlers"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/auth/login", auth.HandleLogin)
	mux.HandleFunc("/auth/logout", auth.HandleLogout)
	mux.HandleFunc("/auth/malTokenFromCode", auth.HandleMalTokenFromCode)
	mux.HandleFunc("/auth/malRefresh", auth.HandleMalRefresh)

	mux.HandleFunc("/api/v1/health", handlers.HandleGetHealth)
	mux.HandleFunc("/api/v1/malProxy", handlers.HandleMalProxy)
	return mux
}
