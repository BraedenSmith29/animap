package services

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestBuildGraph(t *testing.T) {
	t.Setenv("X_MAL_CLIENT_ID", "testutils-client-id")

	restore := useMockedMALHTTPClient(t, func(req *http.Request) (*http.Response, error) {
		if req.Method != http.MethodGet {
			t.Fatalf("expected GET request, got %s", req.Method)
		}

		switch req.URL.Path {
		case "/v2/anime/100":
			return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(`{"id":100,"title":"Root Anime","num_list_users":50,"media_type":"tv","status":"finished_airing","num_episodes":12,"related_anime":[{"node":{"id":200},"relation_type":"sequel","relation_type_formatted":"Sequel"}]}`))}, nil
		case "/v2/anime/200":
			return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(`{"id":200,"title":"Second Anime","num_list_users":20,"media_type":"movie","status":"finished_airing","num_episodes":1,"related_anime":[]}`))}, nil
		default:
			t.Fatalf("unexpected MAL path requested: %s", req.URL.Path)
			return nil, nil
		}
	})
	t.Cleanup(restore)

	graph, err := GetAnimeGraph("100")
	if err != nil {
		t.Fatalf("failed to build graph: %v", err)
	}

	if len(graph.Nodes) != 2 {
		t.Fatalf("expected 2 nodes, got %d", len(graph.Nodes))
	}

	if len(graph.Edges) != 1 {
		t.Fatalf("expected 1 edge, got %d", len(graph.Edges))
	}

	if graph.Nodes[0].Id != "a100" || graph.Nodes[0].Anime == nil {
		t.Fatalf("expected first node to contain anime details for id 100")
	}

	if !strings.Contains(graph.Edges[0].Id, "a100-a200") {
		t.Fatalf("expected edge id to connect root anime to related anime, got %s", graph.Edges[0].Id)
	}
}
