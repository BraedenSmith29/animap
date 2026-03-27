package services

import (
	"container/list"
	"strconv"

	"github.com/braedensmith29/animap/server/scraper"
)

type nodeType string

const (
	AnimeNode nodeType = "anime"
	MangaNode nodeType = "manga"
)

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
	NumListUsers           *int     `json:"numListUsers,omitempty"`
	MediaType              *string  `json:"mediaType,omitempty"`
	Status                 *string  `json:"status,omitempty"`
	NumEpisodes            *int     `json:"numEpisodes,omitempty"`
	Source                 *string  `json:"source,omitempty"`
	AverageEpisodeDuration *int     `json:"averageEpisodeDuration,omitempty"`
	Rating                 *string  `json:"rating,omitempty"`
}

type author struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Role      string `json:"role"`
}

type manga struct {
	MalId        string   `json:"malId"`
	Title        string   `json:"title"`
	EnTitle      *string  `json:"enTitle,omitempty"`
	JaTitle      *string  `json:"jaTitle,omitempty"`
	MainPicture  *string  `json:"mainPicture,omitempty"`
	StartDate    *string  `json:"startDate,omitempty"`
	EndDate      *string  `json:"endDate,omitempty"`
	Synopsis     *string  `json:"synopsis,omitempty"`
	Mean         *float64 `json:"meanScore,omitempty"`
	NumListUsers int      `json:"numListUsers"`
	Nsfw         *string  `json:"nsfw,omitempty"`
	MediaType    string   `json:"mediaType"`
	Status       string   `json:"status"`
	NumVolumes   int      `json:"numVolumes"`
	NumChapters  int      `json:"numChapters"`
	Authors      []author `json:"authors"`
}

type node struct {
	Id       string   `json:"id"`
	Label    string   `json:"label"`
	NodeType nodeType `json:"nodeType"`
	Anime    *anime   `json:"anime,omitempty"`
	Manga    *manga   `json:"manga,omitempty"`
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

	queue := list.New()
	firstItem := queueItem{
		NodeType: AnimeNode,
		Id:       animeId,
	}
	queue.PushBack(firstItem)
	alreadyQueued := make(map[string]bool)
	alreadyQueued[string(firstItem.NodeType)+":"+firstItem.Id] = true

	for queue.Len() > 0 {
		nextItem := queue.Front()
		if nextItem == nil {
			break
		}
		queue.Remove(nextItem)
		item := nextItem.Value.(queueItem)

		var newQueueItems *[]queueItem
		var err error
		if item.NodeType == AnimeNode {
			newQueueItems, err = amg.addAnimeToGraph(item.Id)
		} else if item.NodeType == MangaNode {
			//newQueueItems, err = amg.addMangaToGraph(item.Id)
		}

		if err != nil {
			return nil, err
		}

		if newQueueItems != nil {
			// Add related items to the queue
			for _, newItem := range *newQueueItems {
				key := string(newItem.NodeType) + ":" + newItem.Id
				if !alreadyQueued[key] {
					queue.PushBack(newItem)
					alreadyQueued[key] = true
				}
			}
		}
	}

	return &amg, nil
}

func (amg *AniMapGraph) addAnimeToGraph(animeId string) (*[]queueItem, error) {
	ad, err := scraper.ScrapeRelatedEntries("anime", animeId)
	if err != nil {
		return nil, err
	}

	a := anime{
		MalId:                  strconv.Itoa(ad.Id),
		Title:                  ad.Title,
		EnTitle:                ad.TitleEnglish,
		JaTitle:                ad.TitleJapanese,
		MainPicture:            &ad.ImageUrl,
		StartDate:              ad.StartDate,
		EndDate:                ad.EndDate,
		Synopsis:               ad.Synopsis,
		Mean:                   ad.Score,
		NumListUsers:           ad.Members,
		MediaType:              ad.MediaType,
		Status:                 ad.Status,
		NumEpisodes:            ad.NumEpisodes,
		Source:                 ad.Source,
		AverageEpisodeDuration: ad.Duration,
		Rating:                 ad.Rating,
	}
	amg.Nodes = append(amg.Nodes, node{
		Id:       "a" + a.MalId,
		Label:    a.Title,
		NodeType: AnimeNode,
		Anime:    &a,
	})

	var newQueueItems []queueItem
	//for _, related := range ad.RelatedAnime {
	//	//if !(edge.Relationship == "prequel" || edge.Relationship == "parent_story") {
	//	sourceNodeId := "a" + strconv.Itoa(ad.Id)
	//	targetNodeId := "a" + strconv.Itoa(related.Node.Id)
	//	amg.Edges = append(amg.Edges, edge{
	//		Source:       sourceNodeId,
	//		Target:       targetNodeId,
	//		Id:           sourceNodeId + "-" + targetNodeId,
	//		Label:        related.RelationTypeFormatted,
	//		Relationship: related.RelationType,
	//	})
	//	newQueueItems = append(newQueueItems, queueItem{
	//		NodeType: AnimeNode,
	//		Id:       strconv.Itoa(related.Node.Id),
	//	})
	//}
	//for _, related := range ad.RelatedManga {
	//	//if !(edge.Relationship == "prequel" || edge.Relationship == "parent_story") {
	//	sourceNodeId := "a" + strconv.Itoa(ad.Id)
	//	targetNodeId := "m" + strconv.Itoa(related.Node.Id)
	//	amg.Edges = append(amg.Edges, edge{
	//		Source:       sourceNodeId,
	//		Target:       targetNodeId,
	//		Id:           sourceNodeId + "-" + targetNodeId,
	//		Label:        related.RelationTypeFormatted,
	//		Relationship: related.RelationType,
	//	})
	//	newQueueItems = append(newQueueItems, queueItem{
	//		NodeType: MangaNode,
	//		Id:       strconv.Itoa(related.Node.Id),
	//	})
	//}

	for _, entry := range ad.Related {
		sourceNodeId := "a" + a.MalId
		var targetNodeId string
		if entry.Type == "anime" {
			targetNodeId = "a" + entry.Id
		} else if entry.Type == "manga" {
			targetNodeId = "m" + entry.Id
			continue
		}
		amg.Edges = append(amg.Edges, edge{
			Source:       sourceNodeId,
			Target:       targetNodeId,
			Id:           sourceNodeId + "-" + targetNodeId,
			Label:        entry.RelationType,
			Relationship: entry.RelationType,
		})
		newQueueItems = append(newQueueItems, queueItem{
			NodeType: nodeType(entry.Type),
			Id:       entry.Id,
		})
	}

	return &newQueueItems, nil
}

//func (amg *AniMapGraph) addMangaToGraph(mangaId string) (*[]queueItem, error) {
//	md, err := getMangaDetails(mangaId)
//	if err != nil {
//		return nil, err
//	}
//
//	m := md.extractMangaDetails()
//	amg.Nodes = append(amg.Nodes, node{
//		Id:       "m" + m.MalId,
//		Label:    m.Title,
//		NodeType: MangaNode,
//		Manga:    &m,
//	})
//
//	var newQueueItems []queueItem
//	//for _, related := range md.RelatedAnime {
//	//	//if !(edge.Relationship == "prequel" || edge.Relationship == "parent_story") {
//	//	sourceNodeId := "m" + strconv.Itoa(md.Id)
//	//	targetNodeId := "a" + strconv.Itoa(related.Node.Id)
//	//	amg.Edges = append(amg.Edges, edge{
//	//		Source:       sourceNodeId,
//	//		Target:       targetNodeId,
//	//		Id:           sourceNodeId + "-" + targetNodeId,
//	//		Label:        related.RelationTypeFormatted,
//	//		Relationship: related.RelationType,
//	//	})
//	//	newQueueItems = append(newQueueItems, queueItem{
//	//		NodeType: AnimeNode,
//	//		Id:       strconv.Itoa(related.Node.Id),
//	//	})
//	//}
//	//for _, related := range md.RelatedManga {
//	//	//if !(edge.Relationship == "prequel" || edge.Relationship == "parent_story") {
//	//	sourceNodeId := "m" + strconv.Itoa(md.Id)
//	//	targetNodeId := "m" + strconv.Itoa(related.Node.Id)
//	//	amg.Edges = append(amg.Edges, edge{
//	//		Source:       sourceNodeId,
//	//		Target:       targetNodeId,
//	//		Id:           sourceNodeId + "-" + targetNodeId,
//	//		Label:        related.RelationTypeFormatted,
//	//		Relationship: related.RelationType,
//	//	})
//	//	newQueueItems = append(newQueueItems, queueItem{
//	//		NodeType: MangaNode,
//	//		Id:       strconv.Itoa(related.Node.Id),
//	//	})
//	//}
//
//	entries, err := scraper.ScrapeRelatedEntries("m", m.MalId)
//	if err != nil {
//		return nil, err
//	}
//	for _, entry := range *entries {
//		sourceNodeId := "m" + m.MalId
//		var targetNodeId string
//		if entry.Type == "anime" {
//			targetNodeId = "a" + entry.Id
//		} else if entry.Type == "manga" {
//			targetNodeId = "m" + entry.Id
//		}
//		amg.Edges = append(amg.Edges, edge{
//			Source:       sourceNodeId,
//			Target:       targetNodeId,
//			Id:           sourceNodeId + "-" + targetNodeId,
//			Label:        entry.RelationType,
//			Relationship: entry.RelationType,
//		})
//		newQueueItems = append(newQueueItems, queueItem{
//			NodeType: nodeType(entry.Type),
//			Id:       entry.Id,
//		})
//	}
//
//	return &newQueueItems, nil
//}
