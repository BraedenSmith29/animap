package main

import (
	"log"
	"net/http"

	"github.com/braedensmith29/animap/server"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println(err)
		log.Fatal("Error loading .env file. Ensure you are running from /api.")
	}

	router := server.NewRouter()

	log.Println("API server listening on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
