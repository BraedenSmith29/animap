package auth

import (
	"net/http"
	"os"
)

func HandleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:   "refresh_token",
		Value:  "",
		Path:   "/auth/malRefresh",
		Secure: os.Getenv("APP_ENV") == "PROD",
		MaxAge: -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:   "is_logged_in",
		Value:  "",
		Path:   "/",
		Secure: os.Getenv("APP_ENV") == "PROD",
		MaxAge: -1,
	})

	http.Redirect(w, r, "/", http.StatusFound)
}
