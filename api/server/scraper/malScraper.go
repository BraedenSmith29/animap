package scraper

import (
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

// ScrapeRelatedEntries fetches the MAL page for the given animeId and
// returns the children of div.related-entries as a list of HTML node strings for demonstration.
// In a real scenario, you might want to return structured data.
func ScrapeRelatedEntries(mediaType string, malId string) (*AnimeDetails, error) {
	resp, err := http.Get(fmt.Sprintf("https://myanimelist.net/%s/%s", mediaType, malId))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GET %s\nunexpected status code: %d", resp.Request.URL, resp.StatusCode)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	parser := &AnimeParser{
		doc: doc,
	}

	return parser.Parse(), nil
}

type Relation struct {
	RelationType string
	Id           string
	Type         string
}

func pullFromTiles(s *goquery.Selection) (*[]Relation, error) {
	var relations []Relation
	tiles := s.Find(".entry")
	for _, tile := range tiles.EachIter() {
		relationType, err := parseText(tile.Find(".relation").First().Text())
		if err != nil {
			return nil, err
		}
		relationUrl, exists := tile.Find(".title a").First().Attr("href")
		if relationType == "" || !exists {
			continue
		}
		u, err := url.Parse(relationUrl)
		if err != nil {
			return nil, err
		}

		parts := strings.Split(strings.Trim(u.Path, "/"), "/")
		if len(parts) < 2 {
			return nil, fmt.Errorf("malformed url: %s", relationUrl)
		}

		category := parts[0]
		id := parts[1]
		relations = append(relations, Relation{
			RelationType: relationType,
			Id:           id,
			Type:         category,
		})
	}
	return &relations, nil
}

func pullFromTable(s *goquery.Selection) (*[]Relation, error) {
	var relations []Relation

	tbody := s.Find("tbody").First()

	for _, trow := range tbody.Find("tr").EachIter() {
		relationType, err := parseText(trow.Find("td").First().Text())
		if err != nil {
			return nil, err
		}
		for _, relationAnchor := range trow.Find(".entries li a").EachIter() {
			relationUrl, exists := relationAnchor.Attr("href")
			if !exists {
				continue
			}
			u, err := url.Parse(relationUrl)
			if err != nil {
				return nil, err
			}

			parts := strings.Split(strings.Trim(u.Path, "/"), "/")
			if len(parts) < 2 {
				return nil, fmt.Errorf("malformed url: %s", relationUrl)
			}

			category := parts[0]
			id := parts[1]
			relations = append(relations, Relation{
				RelationType: relationType,
				Id:           id,
				Type:         category,
			})
		}
	}

	return &relations, nil
}

func parseText(text string) (string, error) {
	splitOnNewLine := strings.Split(text, "\n")
	var tokens []string
	for _, line := range splitOnNewLine {
		token := strings.TrimSpace(line)
		isParens, err := regexp.Match(`\(.*\)`, []byte(token))
		if err != nil {
			return "", err
		}
		if isParens || token == "" {
			continue
		}
		tokens = append(tokens, strings.TrimSpace(line))
	}

	cleanString := strings.Join(tokens, " ")

	removeColon := strings.Replace(cleanString, ":", "", -1)

	return removeColon, nil
}
