package services

import (
	"container/list"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type MainPicture struct {
	Medium string `json:"medium"`
	Large  string `json:"large"`
}

type Anime struct {
	Id          string      `json:"id"`
	Label       string      `json:"label"`
	Title       string      `json:"title"`
	EnTitle     string      `json:"en_title"`
	JpTitle     string      `json:"jp_title"`
	MainPicture MainPicture `json:"main_picture"`
}

type Edge struct {
	Source       string `json:"source"`
	Target       string `json:"target"`
	Id           string `json:"id"`
	Label        string `json:"label"`
	Relationship string `json:"relationship"`
}

type AnimeInfo struct {
	Id                int         `json:"id"`
	Title             string      `json:"title"`
	MainPicture       MainPicture `json:"main_picture"`
	AlternativeTitles struct {
		Synonyms []string `json:"synonyms"`
		En       string   `json:"en"`
		Jp       string   `json:"jp"`
	} `json:"alternative_titles"`
	RelatedAnime []struct {
		Node struct {
			Id          int         `json:"id"`
			Title       string      `json:"title"`
			MainPicture MainPicture `json:"main_picture"`
		} `json:"node"`
		RelationType          string `json:"relation_type"`
		RelationTypeFormatted string `json:"relation_type_formatted"`
	} `json:"related_anime"`
}

func GetAnimeGraph(animeId string, ignoreOther bool) ([]Anime, []Edge, error) {
	var anime []Anime
	var edges []Edge

	queue := list.List{}
	queue.PushBack(animeId)
	alreadyQueued := make(map[string]bool)
	alreadyQueued[animeId] = true

	for queue.Len() > 0 {
		nextAnimeId := queue.Front()
		if nextAnimeId == nil {
			break
		}
		queue.Remove(nextAnimeId)
		newAnime, newEdges, err := getAnimeDetails(nextAnimeId.Value.(string), ignoreOther)
		if err != nil {
			return nil, nil, err
		}

		// Process the animeInfo and edges here
		anime = append(anime, newAnime)
		//edges = append(edges, newEdges...)

		// Add related anime to the queue
		for _, edge := range newEdges {
			if !alreadyQueued[edge.Target] {
				queue.PushBack(edge.Target)
				alreadyQueued[edge.Target] = true
			}
			if !(edge.Relationship == "prequel" || edge.Relationship == "parent_story") {
				edges = append(edges, edge)
			}
		}
	}

	return anime, edges, nil
}

func getAnimeDetails(animeId string, ignoreOther bool) (Anime, []Edge, error) {
	animeInfo, err := fetchAnimeInfo(animeId)
	if err != nil {
		return Anime{}, nil, err
	}

	anime := Anime{
		Id:          strconv.Itoa(animeInfo.Id),
		Label:       animeInfo.Title,
		Title:       animeInfo.Title,
		EnTitle:     animeInfo.AlternativeTitles.En,
		JpTitle:     animeInfo.AlternativeTitles.Jp,
		MainPicture: animeInfo.MainPicture,
	}

	var edges []Edge
	for _, related := range animeInfo.RelatedAnime {
		if ignoreOther && related.RelationType == "other" {
			continue
		}
		edge := Edge{
			Source:       strconv.Itoa(animeInfo.Id),
			Target:       strconv.Itoa(related.Node.Id),
			Id:           fmt.Sprintf("%d-%d", animeInfo.Id, related.Node.Id),
			Label:        related.RelationTypeFormatted,
			Relationship: related.RelationType,
		}
		edges = append(edges, edge)
	}
	return anime, edges, nil
}

var malHttpClient = &http.Client{
	Timeout: time.Second * 10,
}

func fetchAnimeInfo(animeId string) (AnimeInfo, error) {
	xMalClientId := os.Getenv("X_MAL_CLIENT_ID")
	if xMalClientId == "" {
		return AnimeInfo{}, fmt.Errorf("X_MAL_CLIENT_ID not set")
	}

	// Make a request to the MyAnimeList API to fetch the anime graph data
	malRequest, err := http.NewRequest(
		"GET",
		fmt.Sprintf("https://api.myanimelist.net/v2/anime/%s?fields=id,title,main_picture,alternative_titles,related_anime,related_manga", animeId),
		nil,
	)
	if err != nil {
		return AnimeInfo{}, err
	}
	malRequest.Header.Set("X-MAL-CLIENT-ID", xMalClientId)
	malResponse, err := malHttpClient.Do(malRequest)
	if err != nil {
		return AnimeInfo{}, err
	}
	// Ensure body is closed after return
	defer func(Body io.ReadCloser) {
		cerr := Body.Close()
		if cerr != nil {
			log.Printf("warning: closing MAL response body failed: %v\n", cerr)
		}
	}(malResponse.Body)

	if malResponse.StatusCode != http.StatusOK {
		return AnimeInfo{}, fmt.Errorf("MAL API returned non-OK status: %d", malResponse.StatusCode)
	}

	animeInfo := AnimeInfo{}
	err = json.NewDecoder(malResponse.Body).Decode(&animeInfo)
	return animeInfo, err
}
