package http

import (
	"encoding/json"
	netHTTP "net/http"
	"strings"
	"userservice/internal/ports/inbound"
)

type GetUserHandler struct {
	useCase inbound.GetUserUseCase
}

func NewGetUserHandler(useCase inbound.GetUserUseCase) *GetUserHandler {
	return &GetUserHandler{useCase}
}

func (h *GetUserHandler) ServeHTTP(w netHTTP.ResponseWriter, r *netHTTP.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/users/")
	if id == "" || id == "/users" {
		netHTTP.Error(w, "user id is required", netHTTP.StatusBadRequest)
		return
	}

	user, err := h.useCase.Execute(r.Context(), id)
	if err != nil {
		netHTTP.Error(w, err.Error(), netHTTP.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
