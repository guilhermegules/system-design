package http

import (
	"encoding/json"
	"net/http"
	"userservice/internal/ports/inbound"

	"github.com/gorilla/mux"
)

type GetUserHandler struct {
	useCase inbound.GetUserUseCase
}

func NewGetUserHandler(useCase inbound.GetUserUseCase) *GetUserHandler {
	return &GetUserHandler{useCase}
}

// GetUser godoc
// @Summary Get user by ID
// @Description Returns a user
// @Tags users
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} dto.UserDTO
// @Failure 404 {object} dto.ErrorResponse
// @Router /users/{id} [get]
func (h *GetUserHandler) Route(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]

	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	user, err := h.useCase.Execute(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
