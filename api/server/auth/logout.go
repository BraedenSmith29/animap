package auth

import (
	"net/http"
)

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: "access_token", Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	http.SetCookie(w, &http.Cookie{Name: "refresh_token", Value: "", Path: "/auth/malRefresh", MaxAge: -1, HttpOnly: true})
	http.SetCookie(w, &http.Cookie{Name: "is_logged_in", Value: "", Path: "/", MaxAge: -1})

	http.Redirect(w, r, "/", http.StatusFound)
}
