package main

import (
	"log"
	"net/http"
	"os"

	"github.com/braedensmith29/animap/server"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using system environment variables")
	}

	if os.Getenv("APP_ENV") == "" {
		log.Fatalf("No APP_ENV environment variable set")
	}

	router := server.NewRouter()

	log.Println("API server listening on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
