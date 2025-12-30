package http

import (
	"encoding/json"
	netHTTP "net/http"
	"userservice/internal/application/dto"
	"userservice/internal/domain"
	"userservice/internal/ports/inbound"
)

type CreateUserHandler struct {
	useCase inbound.CreateUserUseCase
}

func NewCreateUserHandler(useCase inbound.CreateUserUseCase) *CreateUserHandler {
	return &CreateUserHandler{useCase}
}

func (h *CreateUserHandler) ServeHTTP(w netHTTP.ResponseWriter, r *netHTTP.Request) {
	var req dto.CreateUserDTO

	_ = json.NewDecoder(r.Body).Decode(&req)

	id, err := h.useCase.Execute(r.Context(), req.Name, req.Email)

	if err != nil {
		if err == domain.ErrInvalidUser {
			netHTTP.Error(w, err.Error(), netHTTP.StatusBadRequest)
			return
		}

		netHTTP.Error(w, err.Error(), netHTTP.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"id": id})
}
