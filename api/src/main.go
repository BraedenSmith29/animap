package src

import (
	"log"
	"net/http"
)

func main() {
	router := NewRouter()

	log.Println("API server listening on :8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal(err)
	}
}
