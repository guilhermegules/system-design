package command

import (
	"context"
	"errors"
	"testing"
	"userservice/internal/domain"
)

type fakeUserWriteRepository struct {
	createdUser domain.User
	err         error
}

func (f *fakeUserWriteRepository) Create(ctx context.Context, user domain.User) error {
	f.createdUser = user
	return f.err
}

type fakeEventPublisher struct {
	publishedTopic string
	publishedEvent any
}

func (f *fakeEventPublisher) Publish(topic string, event any) error {
	f.publishedTopic = topic
	f.publishedEvent = event
	return nil
}

func TestCreateUserService_Execute_Success(t *testing.T) {
	ctx := context.Background()

	repo := &fakeUserWriteRepository{}
	publisher := &fakeEventPublisher{}

	service := NewCreateUserService(repo, publisher)

	id, err := service.Execute(ctx, "John Doe", "john@doe.com")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if id == "" {
		t.Fatal("expected user ID, got empty string")
	}

	if repo.createdUser.Name != "John Doe" {
		t.Fatalf("expected name 'John Doe', got %s", repo.createdUser.Name)
	}

	if repo.createdUser.Email != "john@doe.com" {
		t.Fatalf("expected email 'john@doe.com', got %s", repo.createdUser.Email)
	}

	if publisher.publishedTopic != "user.created" {
		t.Fatalf("expected topic 'user.created', got %s", publisher.publishedTopic)
	}

	if publisher.publishedEvent == nil {
		t.Fatal("expected published event, got nil")
	}
}

func TestCreateUserService_Execute_InvalidUser(t *testing.T) {
	ctx := context.Background()

	repo := &fakeUserWriteRepository{}
	publisher := &fakeEventPublisher{}

	service := NewCreateUserService(repo, publisher)

	id, err := service.Execute(ctx, "", "")
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrInvalidUser) {
		t.Fatalf("expected ErrInvalidUser, got %v", err)
	}

	if id != "" {
		t.Fatalf("expected empty id, got %s", id)
	}
}

func TestCreateUserService_Execute_RepositoryError(t *testing.T) {
	ctx := context.Background()

	expectedErr := errors.New("db error")

	repo := &fakeUserWriteRepository{
		err: expectedErr,
	}
	publisher := &fakeEventPublisher{}

	service := NewCreateUserService(repo, publisher)

	id, err := service.Execute(ctx, "John Doe", "john@doe.com")
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Fatalf("expected %v, got %v", expectedErr, err)
	}

	if id != "" {
		t.Fatalf("expected empty id, got %s", id)
	}

	if publisher.publishedEvent != nil {
		t.Fatal("event should not be published when repository fails")
	}
}
