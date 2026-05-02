//go:build production

package ui

import (
	"embed"
	"net/http"
	"path"
)

//go:embed dist
var dist embed.FS

func HandleUi(w http.ResponseWriter, r *http.Request) {
	cleanPath := path.Clean(r.URL.Path)
	fullPath := path.Join("dist", cleanPath)

	f, err := dist.Open(fullPath)
	if err != nil {
		http.ServeFileFS(w, r, dist, "dist/index.html")
		return
	}
	f.Close()
	http.ServeFileFS(w, r, dist, fullPath)
}
