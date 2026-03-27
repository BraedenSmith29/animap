package scraper

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// MalURL represents a MyAnimeList URL with a name.
type MalURL struct {
	Name string
	URL  string
}

// AnimeParser parses a GoQuery document for anime information.
type AnimeParser struct {
	doc *goquery.Document
}

type AnimeDetails struct {
	Id            int
	Title         string
	TitleEnglish  *string
	TitleJapanese *string
	ImageUrl      string
	Synopsis      *string
	StartDate     *string
	EndDate       *string
	Status        *string
	Score         *float64
	Members       *int
	MediaType     *string
	Source        *string
	NumEpisodes   *int
	Duration      *int
	Rating        *string
	Related       []Relation
}

// Parse extracts all information from the document and returns an Anime struct.
func (p *AnimeParser) Parse() *AnimeDetails {
	return &AnimeDetails{
		Id:            p.GetID(),
		Title:         p.GetTitle(),
		TitleEnglish:  p.GetTitleEnglish(),
		TitleJapanese: p.GetTitleJapanese(),
		ImageUrl:      p.GetImageURL(),
		Synopsis:      p.GetSynopsis(),
		StartDate:     p.GetStartDate(),
		EndDate:       p.GetEndDate(),
		Status:        p.GetStatus(),
		Score:         p.GetScore(),
		Members:       p.GetMembers(),
		MediaType:     p.GetType(),
		Source:        p.GetSource(),
		NumEpisodes:   p.GetEpisodes(),
		Duration:      p.GetDuration(),
		Rating:        p.GetRating(),
		Related:       p.GetRelated(),
	}
}

func (p *AnimeParser) GetID() int {
	return idFromURL(p.GetURL())
}

func (p *AnimeParser) GetURL() string {
	return p.doc.Find("meta[property='og:url']").AttrOr("content", "")
}

func (p *AnimeParser) GetTitle() string {
	return p.doc.Find("meta[property='og:title']").AttrOr("content", "")
}

func (p *AnimeParser) GetImageURL() string {
	return p.doc.Find("meta[property='og:image']").AttrOr("content", "")
}

func (p *AnimeParser) GetSynopsis() *string {
	synopsis := cleanse(p.doc.Find("p[itemprop='description']").Text())
	if strings.HasPrefix(synopsis, "No synopsis information has been added to this title.") {
		return nil
	}
	return &synopsis
}

func (p *AnimeParser) GetApproved() bool {
	node := p.doc.Find("#addtolist span:contains('pending approval')")
	return node.Length() == 0
}

func (p *AnimeParser) GetTitleEnglish() *string {
	return p.getSidebarText("English:")
}

func (p *AnimeParser) GetTitleSynonyms() []string {
	text := p.getSidebarText("Synonyms:")
	if text == nil {
		return []string{}
	}
	parts := strings.Split(*text, ", ")
	var synonyms []string
	for _, part := range parts {
		synonyms = append(synonyms, cleanse(part))
	}
	return synonyms
}

func (p *AnimeParser) GetTitleJapanese() *string {
	return p.getSidebarText("Japanese:")
}

func (p *AnimeParser) GetType() *string {
	t := p.getSidebarText("Type:")
	if t != nil && *t == "Unknown" {
		return nil
	}
	return t
}

func (p *AnimeParser) GetEpisodes() *int {
	text := p.getSidebarText("Episodes:")
	if text == nil || *text == "Unknown" {
		return nil
	}
	ep, err := strconv.Atoi(*text)
	if err != nil {
		return nil
	}
	return &ep
}

func (p *AnimeParser) GetStatus() *string {
	return p.getSidebarText("Status:")
}

func (p *AnimeParser) GetSource() *string {
	return p.getSidebarText("Source:")
}

func (p *AnimeParser) GetDuration() *int {
	durationStr := p.getSidebarText("Duration:")
	if durationStr == nil || *durationStr == "Unknown" {
		return nil
	}
	re := regexp.MustCompile(`(?:(\d+)\s*hr\.?\s*)?(?:(\d+)\s*min\.?)?`)
	match := re.FindStringSubmatch(strings.TrimSpace(*durationStr))
	if match == nil {
		return nil
	}
	total := 0
	if match[1] != "" {
		h, err := strconv.Atoi(match[1])
		if err != nil {
			return nil
		}
		total += h * 60
	}
	if match[2] != "" {
		m, err := strconv.Atoi(match[2])
		if err != nil {
			return nil
		}
		total += m
	}
	return &total
}

func (p *AnimeParser) GetRating() *string {
	r := p.getSidebarText("Rating:")
	if r != nil && *r == "None" {
		return nil
	}
	return r
}

func (p *AnimeParser) GetScore() *float64 {
	scoreStr := cleanse(p.doc.Find("span[itemprop='ratingValue']").Text())
	if scoreStr == "" || scoreStr == "N/A" {
		return nil
	}
	score, err := strconv.ParseFloat(scoreStr, 64)
	if err != nil {
		return nil
	}
	return &score
}

func (p *AnimeParser) GetScoredBy() *int {
	countStr := cleanse(p.doc.Find("span[itemprop='ratingCount']").Text())
	if countStr == "" {
		return nil
	}
	countStr = strings.ReplaceAll(countStr, ",", "")
	countStr = strings.ReplaceAll(countStr, " users", "")
	countStr = strings.ReplaceAll(countStr, " user", "")
	count, err := strconv.Atoi(countStr)
	if err != nil {
		return nil
	}
	return &count
}

func (p *AnimeParser) GetMembers() *int {
	memStr := p.getSidebarText("Members:")
	if memStr == nil {
		return nil
	}
	cleaned := strings.ReplaceAll(*memStr, ",", "")
	mem, err := strconv.Atoi(cleaned)
	if err != nil {
		return nil
	}
	return &mem
}

func (p *AnimeParser) GetRelated() []Relation {
	related := make([]Relation, 0)

	relatedEntriesDiv := p.doc.Find("div.related-entries").First()
	if relatedEntriesDiv.Length() == 0 {
		return related
	}

	tileRelations, err := pullFromTiles(relatedEntriesDiv)
	if err != nil {
		return related
	}
	related = append(related, *tileRelations...)

	tableRelations, err := pullFromTable(relatedEntriesDiv)
	if err != nil {
		return related
	}
	related = append(related, *tableRelations...)

	return related
}

//func (p *AnimeParser) GetRelated() []Relation {
//	related := make([]Relation, 0)
//
//	// Tiles
//	p.doc.Find("div.related-entries div.entries-tile div.entry").Each(func(i int, s *goquery.Selection) {
//		relNode := s.Find(".content .relation")
//		if relNode.Length() == 0 {
//			return
//		}
//		relType := cleanse(relNode.Text())
//		// Strip entry type (if any) eg. (TV)
//		re := regexp.MustCompile(`\s\(.*\)`)
//		relType = cleanse(re.ReplaceAllString(relType, ""))
//
//		var links []MalURL
//		s.Find(".content .title a").Each(func(j int, a *goquery.Selection) {
//			name := cleanse(a.Text())
//			if name == "" {
//				return
//			}
//			href, exists := a.Attr("href")
//			if !exists {
//
//			}
//			u, err := url.Parse(href)
//			if err != nil {
//				return nil, err
//			}
//
//			parts := strings.Split(strings.Trim(u.Path, "/"), "/")
//			if len(parts) < 2 {
//				return nil, fmt.Errorf("malformed url: %s", relationUrl)
//			}
//
//			category := parts[0]
//			id := parts[1]
//			relations = append(relations, Relation{
//				RelationType: relationType,
//				Id:           id,
//				Type:         category,
//			})
//		})
//		if len(links) > 0 || relType != "" {
//			related[relType] = append(related[relType], links...)
//		}
//	})
//
//	// Table
//	p.doc.Find("table.entries-table tr").Each(func(i int, s *goquery.Selection) {
//		relType := cleanse(strings.ReplaceAll(s.Find("td:first-child").Text(), ":", ""))
//		var links []MalURL
//		s.Find("td:nth-child(2) a").Each(func(j int, a *goquery.Selection) {
//			name := cleanse(a.Text())
//			if name == "" {
//				return
//			}
//			url, exists := a.Attr("href")
//			if exists {
//				links = append(links, MalURL{Name: name, URL: url})
//			}
//		})
//		if len(links) > 0 || relType != "" {
//			related[relType] = append(related[relType], links...)
//		}
//	})
//
//	return related
//}

func (p *AnimeParser) GetBackground() *string {
	parent := p.doc.Find("p[itemprop='description']").Parent()
	if parent.Length() == 0 {
		return nil
	}

	// Clone to avoid modifying the original document
	clone := parent.Clone()
	clone.Find("p").Remove()
	clone.Find("h2").Remove() // Usually there's a Background header

	bg := cleanse(clone.Text())
	if bg == "" || strings.Contains(bg, "No background information has been added to this title") {
		return nil
	}
	return &bg
}

func (p *AnimeParser) GetStartDate() *string {
	airedStr := p.GetAnimeAiredString()
	if airedStr == nil {
		return nil
	}
	if !strings.Contains(*airedStr, " to ") {
		return nil
	}
	components := strings.Split(*airedStr, " to ")
	if len(components) != 2 {
		return nil
	}
	startDate := strings.TrimSpace(components[0])
	return &startDate
}

func (p *AnimeParser) GetEndDate() *string {
	airedStr := p.GetAnimeAiredString()
	if airedStr == nil {
		return nil
	}
	if !strings.Contains(*airedStr, " to ") {
		return nil
	}
	components := strings.Split(*airedStr, " to ")
	if len(components) != 2 {
		return nil
	}
	endDate := strings.TrimSpace(components[1])
	if endDate == "?" {
		return nil
	}
	return &endDate
}

func (p *AnimeParser) GetAnimeAiredString() *string {
	selection := p.doc.Find("span:contains('Aired:')").Parent()
	if selection.Length() == 0 {
		return nil
	}

	fullText := selection.Text()
	aired := strings.TrimSpace(strings.TrimPrefix(fullText, "Aired:"))
	if aired == "Not available" {
		return nil
	}
	return &aired
}

func (p *AnimeParser) GetPreview() *string {
	video, exists := p.doc.Find("div.video-promotion a").Attr("href")
	if !exists {
		return nil
	}
	return &video
}

func (p *AnimeParser) getSidebarText(label string) *string {
	selection := p.doc.Find(fmt.Sprintf("span:contains('%s')", label)).Parent()
	if selection.Length() == 0 {
		return nil
	}
	text := cleanse(strings.TrimPrefix(selection.Text(), label))
	if text == "" {
		return nil
	}
	return &text
}

// cleanse cleans up whitespace in strings.
func cleanse(s string) string {
	return strings.TrimSpace(s)
}

// idFromURL extracts the ID from a MAL URL.
func idFromURL(urlStr string) int {
	// Mal URLs look like: https://myanimelist.net/anime/20/Naruto
	re := regexp.MustCompile(`/anime/(\d+)`)
	matches := re.FindStringSubmatch(urlStr)
	if len(matches) > 1 {
		id, _ := strconv.Atoi(matches[1])
		return id
	}
	return 0
}
