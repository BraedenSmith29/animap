package services

import (
	"container/list"
	"strconv"
)

type nodeType string

const (
	AnimeNode nodeType = "anime"
	MangaNode nodeType = "manga"
)

type node struct {
	Id       string   `json:"id"`
	Label    string   `json:"label"`
	NodeType nodeType `json:"nodeType"`
	Anime    *anime   `json:"anime,omitempty"`
	//Manga    *Manga   `json:"manga,omitempty"`
}

type edge struct {
	Source       string `json:"source"`
	Target       string `json:"target"`
	Id           string `json:"id"`
	Label        string `json:"label"`
	Relationship string `json:"relationship"`
}

type queueItem struct {
	NodeType nodeType
	Id       string
}

type AniMapGraph struct {
	Nodes []node `json:"nodes"`
	Edges []edge `json:"edges"`
}

func GetAnimeGraph(animeId string) (*AniMapGraph, error) {
	amg := AniMapGraph{}

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
		newQueueItems, err := amg.addAnimeToGraph(nextAnimeId.Value.(string))
		if err != nil {
			return nil, err
		}

		// Add related anime to the queue
		for _, newItem := range *newQueueItems {
			if !alreadyQueued[newItem.Id] {
				queue.PushBack(newItem.Id)
				alreadyQueued[newItem.Id] = true
			}
		}
	}

	return &amg, nil
}

func (amg *AniMapGraph) addAnimeToGraph(animeId string) (*[]queueItem, error) {
	ad, err := getAnimeDetails(animeId)
	if err != nil {
		return nil, err
	}

	anime := ad.extractAnimeDetails()
	amg.Nodes = append(amg.Nodes, node{
		Id:       "a" + anime.MalId,
		Label:    anime.Title,
		NodeType: AnimeNode,
		Anime:    &anime,
	})

	var newQueueItems []queueItem
	for _, related := range ad.RelatedAnime {
		//if !(edge.Relationship == "prequel" || edge.Relationship == "parent_story") {
		sourceNodeId := "a" + strconv.Itoa(ad.Id)
		targetNodeId := "a" + strconv.Itoa(related.Node.Id)
		amg.Edges = append(amg.Edges, edge{
			Source:       sourceNodeId,
			Target:       targetNodeId,
			Id:           sourceNodeId + "-" + targetNodeId,
			Label:        related.RelationTypeFormatted,
			Relationship: related.RelationType,
		})
		newQueueItems = append(newQueueItems, queueItem{
			NodeType: AnimeNode,
			Id:       strconv.Itoa(related.Node.Id),
		})
	}
	return &newQueueItems, nil
}
