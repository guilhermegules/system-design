package inbound

import (
	"context"
	"userservice/internal/application/dto"
)

type GetUserUseCase interface {
	Execute(ctx context.Context, id string) (*dto.UserDTO, error)
}
