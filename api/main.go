package main

import (
	"log"
	"net/http"

	"github.com/braedensmith29/animap/server"
)

func main() {
	router := server.NewRouter()

	log.Println("API server listening on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
