package http

import (
	"net/http"

	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
)

type RouterDeps struct {
	Env               string
	GetUserHandler    *GetUserHandler
	CreateUserHandler *CreateUserHandler
}

func NewRouter(deps RouterDeps) http.Handler {
	r := mux.NewRouter()

	api := r.PathPrefix("/api").Subrouter()

	// Swagger
	if deps.Env != "prd" {
		api.PathPrefix("/swagger/").
			Handler(httpSwagger.WrapHandler)
	}

	// Users
	api.HandleFunc("/users", deps.CreateUserHandler.Route).
		Methods(http.MethodPost)

	api.HandleFunc("/users/{id}", deps.GetUserHandler.Route).
		Methods(http.MethodGet)

	return r
}
