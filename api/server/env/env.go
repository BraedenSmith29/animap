package env

import (
	"fmt"
	"os"
)

func Get(key string) (string, error) {
	value := os.Getenv(key)
	if value == "" {
		return "", fmt.Errorf("environment variable %s is not set", key)
	}
	return value, nil
}

func MustGet(key string) string {
	value, err := Get(key)
	if err != nil {
		panic(err)
	}
	return value
}

func IsProd() bool {
	return MustGet("APP_ENV") == "PROD"
}

func IsDev() bool {
	return MustGet("APP_ENV") == "DEV"
}

func IsTest() bool {
	return MustGet("APP_ENV") == "TEST"
}
