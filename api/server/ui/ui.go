//go:build production

package ui

import (
	"embed"
	"net/http"
)

//go:embed dist
var dist embed.FS

func HandleUi(w http.ResponseWriter, r *http.Request) {
	f, err := dist.Open("dist" + r.URL.Path)
	if err != nil {
		// Fall back to index.html for SPA routing
		http.ServeFileFS(w, r, dist, "dist/index.html")
		return
	}
	f.Close()
	http.ServeFileFS(w, r, dist, "dist"+r.URL.Path)
}
