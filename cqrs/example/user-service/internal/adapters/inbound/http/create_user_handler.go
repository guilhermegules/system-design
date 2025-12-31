package http

import (
	"encoding/json"
	"errors"
	"net/http"
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

// CreateUser godoc
// @Summary Create user
// @Tags users
// @Accept json
// @Produce json
// @Param request body dto.CreateUserRequest true "User data"
// @Success 201 {object} dto.CreateUserResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /users [post]
func (h *CreateUserHandler) Route(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateUserDTO

	_ = json.NewDecoder(r.Body).Decode(&req)

	id, err := h.useCase.Execute(r.Context(), req.Name, req.Email)

	if err != nil {
		if errors.Is(err, domain.ErrInvalidUser) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"id": id})
}
