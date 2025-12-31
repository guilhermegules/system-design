package command

import (
	"context"
	"log/slog"
	"time"
	"userservice/internal/application/events"
	"userservice/internal/domain"
	"userservice/internal/ports/outbound"

	"github.com/google/uuid"
)

type CreateUserService struct {
	repository outbound.UserWriteRepository
	publisher  outbound.EventPublisher
	logger     *slog.Logger
}

func NewCreateUserService(repository outbound.UserWriteRepository, publisher outbound.EventPublisher, logger *slog.Logger) *CreateUserService {
	return &CreateUserService{repository, publisher, logger}
}

func (s *CreateUserService) Execute(ctx context.Context, name, email string) (string, error) {
	s.logger.Info("creating user", "name", name, "email", email)

	user := domain.User{
		ID:        uuid.NewString(),
		Name:      name,
		Email:     email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if !user.IsValidUser() {
		s.logger.Error("invalid user", "name", name, "email", email)
		return "", domain.ErrInvalidUser
	}

	if err := s.repository.Create(ctx, user); err != nil {
		s.logger.Error("failed to persist user", "error", err, "user_id", user.ID)
		return "", err
	}

	if err := s.publisher.Publish("user.created", domainToEvent(user)); err != nil {
		s.logger.Error("failed to publish user.created event", "error", err, "user_id", user.ID)
		return "", err
	}

	s.logger.Info("user created", "user_id", user.ID)

	return user.ID, nil
}

func domainToEvent(user domain.User) *events.UserCreated {
	return &events.UserCreated{ID: user.ID, Name: user.Name, Email: user.Email}
}
