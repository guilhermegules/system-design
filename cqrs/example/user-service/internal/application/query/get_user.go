package query

import (
	"context"
	"userservice/internal/application/ports/outbound"
)

type GetUserService struct {
	repository outbound.UserReadRepository
}

func NewGetUserService(repository outbound.UserReadRepository) *GetUserService {
	return &GetUserService{repository}
}

func (s *GetUserService) Execute(ctx context.Context, id string) (any, error) {
	return s.repository.FindById(ctx, id)
}
