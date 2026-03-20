package services

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

func TestGetAnimeDetails(t *testing.T) {
	t.Setenv("X_MAL_CLIENT_ID", "testutils-client-id")
	restore := useMockedMALHTTPClient(t, func(req *http.Request) (*http.Response, error) {
		if req.Method != http.MethodGet {
			t.Fatalf("expected method %q, got %q", http.MethodGet, req.Method)
		}
		if req.URL.Scheme != "https" || req.URL.Host != "api.myanimelist.net" {
			t.Fatalf("unexpected request url: %s", req.URL.String())
		}
		if !strings.Contains(req.URL.RawQuery, "fields=") {
			t.Fatalf("expected fields query parameter in request: %s", req.URL.RawQuery)
		}
		if clientID := req.Header.Get("X-MAL-CLIENT-ID"); clientID != "testutils-client-id" {
			t.Fatalf("expected X-MAL-CLIENT-ID header to be propagated")
		}

		return &http.Response{
			StatusCode: http.StatusOK,
			Body: io.NopCloser(strings.NewReader(`{
				"id": 101,
				"title": "One Test Anime",
				"main_picture": {"medium": "https://img/med.jpg", "large": "https://img/large.jpg"},
				"alternative_titles": {"en": "English Title", "ja": "Japanese Title"},
				"num_list_users": 123,
				"media_type": "tv",
				"status": "finished_airing",
				"num_episodes": 12,
				"related_anime": [{"node": {"id": 202}, "relation_type": "sequel", "relation_type_formatted": "Sequel"}]
			}`)),
		}, nil
	})
	t.Cleanup(restore)

	details, err := getAnimeDetails("101")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if details.Id != 101 {
		t.Fatalf("expected id 101, got %d", details.Id)
	}
	if len(details.RelatedAnime) != 1 || details.RelatedAnime[0].Node.Id != 202 {
		t.Fatalf("expected related anime to be decoded")
	}
}

func TestExtractAnimeDetails(t *testing.T) {
	t.Run("prefers large image and keeps alt titles", func(t *testing.T) {
		large := "https://img/large.jpg"
		en := "English"
		ja := "Japanese"

		details := animeDetails{
			Id:    77,
			Title: "Sample",
			AlternativeTitles: &struct {
				Synonyms *[]string `json:"synonyms"`
				En       *string   `json:"en"`
				Ja       *string   `json:"ja"`
			}{
				En: &en,
				Ja: &ja,
			},
			MainPicture: &struct {
				Medium string  `json:"medium"`
				Large  *string `json:"large"`
			}{
				Medium: "https://img/medium.jpg",
				Large:  &large,
			},
			NumListUsers: 55,
			MediaType:    "movie",
			Status:       "finished_airing",
		}

		anime := details.extractAnimeDetails()
		if anime.MalId != "77" {
			t.Fatalf("expected mal id 77, got %s", anime.MalId)
		}
		if anime.MainPicture == nil || *anime.MainPicture != large {
			t.Fatalf("expected large image to be selected")
		}
		if anime.EnTitle == nil || *anime.EnTitle != en {
			t.Fatalf("expected english title to be extracted")
		}
		if anime.JaTitle == nil || *anime.JaTitle != ja {
			t.Fatalf("expected japanese title to be extracted")
		}
	})

	t.Run("falls back to medium image and handles missing optional data", func(t *testing.T) {
		details := animeDetails{
			Id:    88,
			Title: "Fallback",
			MainPicture: &struct {
				Medium string  `json:"medium"`
				Large  *string `json:"large"`
			}{
				Medium: "https://img/medium-fallback.jpg",
				Large:  nil,
			},
			NumListUsers: 1,
			MediaType:    "tv",
			Status:       "currently_airing",
		}

		anime := details.extractAnimeDetails()
		if anime.MainPicture == nil || *anime.MainPicture != "https://img/medium-fallback.jpg" {
			t.Fatalf("expected medium image fallback")
		}
		if anime.EnTitle != nil || anime.JaTitle != nil {
			t.Fatalf("expected nil alt titles when source fields are missing")
		}
	})
}
