package services

import (
	"container/list"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"slices"
)

type MainPicture struct {
	Medium string `json:"medium"`
	Large  string `json:"large"`
}

type Anime struct {
	Id          int         `json:"id"`
	Title       string      `json:"title"`
	EnTitle     string      `json:"en_title"`
	JpTitle     string      `json:"jp_title"`
	MainPicture MainPicture `json:"main_picture"`
}

type Edge struct {
	Source       int    `json:"source"`
	Target       int    `json:"target"`
	Id           string `json:"id"`
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

func GetAnimeGraph(animeId int, ignoreOther bool) ([]Anime, []Edge, error) {
	var anime []Anime
	var edges []Edge

	queue := list.List{}
	queue.PushBack(animeId)

	for queue.Len() > 0 {
		nextAnimeId := queue.Front()
		if nextAnimeId == nil {
			break
		}
		queue.Remove(nextAnimeId)
		newAnime, newEdges, err := getAnimeDetails(nextAnimeId.Value.(int), ignoreOther)
		if err != nil {
			return nil, nil, err
		}

		// Process the animeInfo and edges here
		anime = append(anime, newAnime)
		edges = append(edges, newEdges...)

		// Add related anime to the queue
		for _, edge := range newEdges {
			if !slices.ContainsFunc(anime, func(a Anime) bool { return a.Id == edge.Target }) {
				queue.PushBack(edge.Target)
			}
		}
	}

	return anime, edges, nil
}

func getAnimeDetails(animeId int, ignoreOther bool) (Anime, []Edge, error) {
	animeInfo, err := fetchAnimeInfo(animeId)
	if err != nil {
		return Anime{}, nil, err
	}

	anime := Anime{
		Id:          animeInfo.Id,
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
			Source:       animeInfo.Id,
			Target:       related.Node.Id,
			Id:           fmt.Sprintf("%d-%d", animeInfo.Id, related.Node.Id),
			Relationship: related.RelationTypeFormatted,
		}
		edges = append(edges, edge)
	}
	return anime, edges, nil
}

func fetchAnimeInfo(animeId int) (AnimeInfo, error) {
	// Make a request to the MyAnimeList API to fetch the anime graph data
	malRequest, err := http.NewRequest(
		"GET",
		fmt.Sprintf("https://api.myanimelist.net/v2/anime/%d?fields=id,title,main_picture,alternative_titles,related_anime,related_manga", animeId),
		nil,
	)
	if err != nil {
		return AnimeInfo{}, err
	}
	malRequest.Header.Set("X-MAL-CLIENT-ID", os.Getenv("X_MAL_CLIENT_ID"))
	malResponse, err := http.DefaultClient.Do(malRequest)
	if err != nil {
		return AnimeInfo{}, err
	}
	// Ensure body is closed after return
	defer malResponse.Body.Close()

	animeInfo := AnimeInfo{}
	err = json.NewDecoder(malResponse.Body).Decode(&animeInfo)
	return animeInfo, err
}
