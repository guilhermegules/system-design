package http

import (
	"encoding/json"
	netHTTP "net/http"
	"userservice/internal/application/ports/inbound"
)

type CreateUserHandler struct {
	useCase inbound.CreateUserUseCase
}

func NewCreateUserHandler(useCase inbound.CreateUserUseCase) *CreateUserHandler {
	return &CreateUserHandler{useCase}
}

func (h *CreateUserHandler) ServeHTTP(w netHTTP.ResponseWriter, r *netHTTP.Request) {
	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
	}

	_ = json.NewDecoder(r.Body).Decode(&req)

	id, err := h.useCase.Execute(r.Context(), req.Name, req.Email)

	if err != nil {
		netHTTP.Error(w, err.Error(), netHTTP.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"id": id})
}
