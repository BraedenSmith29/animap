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
	Medium string  `json:"medium"`
	Large  *string `json:"large"`
}

type Anime struct {
	Id                     string       `json:"id"`
	Label                  string       `json:"label"`
	Title                  string       `json:"title"`
	EnTitle                *string      `json:"enTitle,omitempty"`
	JaTitle                *string      `json:"jaTitle,omitempty"`
	MainPicture            *MainPicture `json:"mainPicture,omitempty"`
	StartDate              *string      `json:"startDate,omitempty"`
	EndDate                *string      `json:"endDate,omitempty"`
	Synopsis               *string      `json:"synopsis,omitempty"`
	Mean                   *float64     `json:"meanScore,omitempty"`
	NumListUsers           int          `json:"numListUsers"`
	Nsfw                   *string      `json:"nsfw,omitempty"`
	MediaType              string       `json:"mediaType"`
	Status                 string       `json:"status"`
	NumEpisodes            int          `json:"numEpisodes"`
	Source                 *string      `json:"source,omitempty"`
	AverageEpisodeDuration *int         `json:"averageEpisodeDuration,omitempty"`
	Rating                 *string      `json:"rating,omitempty"`
}

type Edge struct {
	Source       string `json:"source"`
	Target       string `json:"target"`
	Id           string `json:"id"`
	Label        string `json:"label"`
	Relationship string `json:"relationship"`
}

type AnimeInfo struct {
	Id                int    `json:"id"`
	Title             string `json:"title"`
	AlternativeTitles *struct {
		Synonyms *[]string `json:"synonyms"`
		En       *string   `json:"en"`
		Ja       *string   `json:"ja"`
	} `json:"alternative_titles"`
	MainPicture            *MainPicture `json:"main_picture"`
	StartDate              *string      `json:"start_date"`
	EndDate                *string      `json:"end_date"`
	Synopsis               *string      `json:"synopsis"`
	Mean                   *float64     `json:"mean"`
	NumListUsers           int          `json:"num_list_users"`
	Nsfw                   *string      `json:"nsfw"`
	MediaType              string       `json:"media_type"`
	Status                 string       `json:"status"`
	NumEpisodes            int          `json:"num_episodes"`
	Source                 *string      `json:"source"`
	AverageEpisodeDuration *int         `json:"average_episode_duration"`
	Rating                 *string      `json:"rating"`
	RelatedAnime           []struct {
		Node struct {
			Id int `json:"id"`
		} `json:"node"`
		RelationType          string `json:"relation_type"`
		RelationTypeFormatted string `json:"relation_type_formatted"`
	} `json:"related_anime"`
}

func GetAnimeGraph(animeId string, ignoreOther bool) ([]Anime, []Edge, error) {
	anime := make([]Anime, 0)
	edges := make([]Edge, 0)

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

	var enTitle, jaTitle *string
	if animeInfo.AlternativeTitles != nil {
		enTitle = animeInfo.AlternativeTitles.En
		jaTitle = animeInfo.AlternativeTitles.Ja
	}

	anime := Anime{
		Id:                     strconv.Itoa(animeInfo.Id),
		Label:                  animeInfo.Title,
		Title:                  animeInfo.Title,
		EnTitle:                enTitle,
		JaTitle:                jaTitle,
		MainPicture:            animeInfo.MainPicture,
		StartDate:              animeInfo.StartDate,
		EndDate:                animeInfo.EndDate,
		Synopsis:               animeInfo.Synopsis,
		Mean:                   animeInfo.Mean,
		NumListUsers:           animeInfo.NumListUsers,
		Nsfw:                   animeInfo.Nsfw,
		MediaType:              animeInfo.MediaType,
		Status:                 animeInfo.Status,
		NumEpisodes:            animeInfo.NumEpisodes,
		Source:                 animeInfo.Source,
		AverageEpisodeDuration: animeInfo.AverageEpisodeDuration,
		Rating:                 animeInfo.Rating,
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
		fmt.Sprintf("https://api.myanimelist.net/v2/anime/%s?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,num_list_users,nsfw,media_type,status,num_episodes,source,average_episode_duration,rating,related_anime,related_manga", animeId),
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
