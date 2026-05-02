//go:build !production

package ui

import (
	"net/http"
)

func HandleUi(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "use node proxy on local", http.StatusNotFound)
}
