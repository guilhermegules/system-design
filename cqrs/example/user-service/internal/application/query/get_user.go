package query

import (
	"context"
	"userservice/internal/application/dto"
	"userservice/internal/ports/outbound"
)

type GetUserService struct {
	repository outbound.UserReadRepository
}

func NewGetUserService(repository outbound.UserReadRepository) *GetUserService {
	return &GetUserService{repository}
}

func (s *GetUserService) Execute(ctx context.Context, id string) (*dto.UserDTO, error) {
	mongoUser, err := s.repository.FindById(ctx, id)

	if err != nil {
		return nil, err
	}

	return &dto.UserDTO{
			ID:    mongoUser.ID,
			Name:  mongoUser.Name,
			Email: mongoUser.Email,
		},
		nil
}
