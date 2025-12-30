package command

import (
	"context"
	"time"
	"userservice/internal/application/ports/outbound"
	"userservice/internal/domain"

	"github.com/google/uuid"
)

type CreateUserService struct {
	repository outbound.UserWriteRepository
	publisher  outbound.EventPublisher
}

func NewCreateUserService(repository outbound.UserWriteRepository, publisher outbound.EventPublisher) *CreateUserService {
	return &CreateUserService{repository, publisher}
}

func (s *CreateUserService) Execute(ctx context.Context, name, email string) (string, error) {
	user := domain.User{
		ID:        uuid.NewString(),
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repository.Create(ctx, user); err != nil {
		return "", err
	}

	_ = s.publisher.Publish("user.created", user)

	return user.ID, nil
}
