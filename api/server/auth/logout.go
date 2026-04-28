package auth

import (
	"net/http"

	"github.com/braedensmith29/animap/server/env"
)

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   "refresh_token",
		Value:  "",
		Path:   "/auth/malRefresh",
		Secure: env.IsProd(),
		MaxAge: -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:   "is_logged_in",
		Value:  "",
		Path:   "/",
		Secure: env.IsProd(),
		MaxAge: -1,
	})

	http.Redirect(w, r, "/", http.StatusFound)
}
