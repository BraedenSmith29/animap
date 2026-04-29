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

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatalf("No PORT environment variable set")
	}

	router := server.NewRouter()

	log.Printf("API server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
}
