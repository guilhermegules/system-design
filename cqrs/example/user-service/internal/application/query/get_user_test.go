package query

import (
	"context"
	"testing"
	"userservice/internal/adapters/outbound/mongo"
	"userservice/internal/application/dto"
)

type fakeUserReadRepository struct {
	user *mongo.UserDocument
	err  error
}

func (f *fakeUserReadRepository) FindById(ctx context.Context, id string) (mongo.UserDocument, error) {
	return *f.user, f.err
}

func TestGetUserService_Execute_Success(t *testing.T) {
	ctx := context.Background()

	repo := &fakeUserReadRepository{
		user: &mongo.UserDocument{
			ID:    "123",
			Name:  "John Doe",
			Email: "john@doe.com",
		},
		err: nil,
	}

	service := NewGetUserService(repo)

	result, err := service.Execute(ctx, "123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expected := &dto.UserDTO{
		ID:    "123",
		Name:  "John Doe",
		Email: "john@doe.com",
	}

	if *result != *expected {
		t.Fatalf("expected %+v, got %+v", expected, result)
	}
}
