package services

import (
	"fmt"
	"testing"

	"github.com/braedensmith29/animap/src/server/services"
	"github.com/joho/godotenv"
)

func TestBuildGraph(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		fmt.Println(err)
		t.Fatalf("Error loading .env file. Ensure you are running from /api.")
	}

	anime, edges, err := services.GetAnimeGraph("52991", true)
	if err != nil {
		t.Fatalf("failed to build graph: %v", err)
	}

	if anime == nil {
		t.Fatalf("failed to build graph: anime is nil")
	}

	if edges == nil {
		fmt.Println(edges)
		t.Fatalf("failed to build graph: edges is nil")
	}
}
