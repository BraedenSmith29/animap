package services

import (
	"fmt"
	"strconv"
)

type animeDetails struct {
	Id                int    `json:"id"`
	Title             string `json:"title"`
	AlternativeTitles *struct {
		Synonyms *[]string `json:"synonyms"`
		En       *string   `json:"en"`
		Ja       *string   `json:"ja"`
	} `json:"alternative_titles"`
	MainPicture *struct {
		Medium string  `json:"medium"`
		Large  *string `json:"large"`
	} `json:"main_picture"`
	StartDate              *string  `json:"start_date"`
	EndDate                *string  `json:"end_date"`
	Synopsis               *string  `json:"synopsis"`
	Mean                   *float64 `json:"mean"`
	NumListUsers           int      `json:"num_list_users"`
	Nsfw                   *string  `json:"nsfw"`
	MediaType              string   `json:"media_type"`
	Status                 string   `json:"status"`
	NumEpisodes            int      `json:"num_episodes"`
	Source                 *string  `json:"source"`
	AverageEpisodeDuration *int     `json:"average_episode_duration"`
	Rating                 *string  `json:"rating"`
	RelatedAnime           []struct {
		Node struct {
			Id int `json:"id"`
		} `json:"node"`
		RelationType          string `json:"relation_type"`
		RelationTypeFormatted string `json:"relation_type_formatted"`
	} `json:"related_anime"`
}

type anime struct {
	MalId                  string   `json:"malId"`
	Title                  string   `json:"title"`
	EnTitle                *string  `json:"enTitle,omitempty"`
	JaTitle                *string  `json:"jaTitle,omitempty"`
	MainPicture            *string  `json:"mainPicture,omitempty"`
	StartDate              *string  `json:"startDate,omitempty"`
	EndDate                *string  `json:"endDate,omitempty"`
	Synopsis               *string  `json:"synopsis,omitempty"`
	Mean                   *float64 `json:"meanScore,omitempty"`
	NumListUsers           int      `json:"numListUsers"`
	Nsfw                   *string  `json:"nsfw,omitempty"`
	MediaType              string   `json:"mediaType"`
	Status                 string   `json:"status"`
	NumEpisodes            int      `json:"numEpisodes"`
	Source                 *string  `json:"source,omitempty"`
	AverageEpisodeDuration *int     `json:"averageEpisodeDuration,omitempty"`
	Rating                 *string  `json:"rating,omitempty"`
}

func getAnimeDetails(animeId string) (*animeDetails, error) {
	malRequest, err := getMalRequest(
		fmt.Sprintf(
			"https://api.myanimelist.net/v2/anime/%s?fields=id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,num_list_users,nsfw,media_type,status,num_episodes,source,average_episode_duration,rating,related_anime,related_manga",
			animeId,
		),
	)
	if err != nil {
		return nil, err
	}

	animeDetails := animeDetails{}
	err = processMalRequestIntoJson(malRequest, &animeDetails)
	if err != nil {
		return nil, err
	}

	return &animeDetails, nil
}

func (details *animeDetails) extractAnimeDetails() anime {
	var enTitle, jaTitle *string
	if details.AlternativeTitles != nil {
		enTitle = details.AlternativeTitles.En
		jaTitle = details.AlternativeTitles.Ja
	}

	var mainPicture *string
	if details.MainPicture != nil {
		if details.MainPicture.Large != nil {
			mainPicture = details.MainPicture.Large
		} else {
			mainPicture = &details.MainPicture.Medium
		}
	}

	return anime{
		MalId:                  strconv.Itoa(details.Id),
		Title:                  details.Title,
		EnTitle:                enTitle,
		JaTitle:                jaTitle,
		MainPicture:            mainPicture,
		StartDate:              details.StartDate,
		EndDate:                details.EndDate,
		Synopsis:               details.Synopsis,
		Mean:                   details.Mean,
		NumListUsers:           details.NumListUsers,
		Nsfw:                   details.Nsfw,
		MediaType:              details.MediaType,
		Status:                 details.Status,
		NumEpisodes:            details.NumEpisodes,
		Source:                 details.Source,
		AverageEpisodeDuration: details.AverageEpisodeDuration,
		Rating:                 details.Rating,
	}
}
