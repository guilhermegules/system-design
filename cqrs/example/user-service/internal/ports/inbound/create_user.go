package inbound

import "context"

type CreateUserUseCase interface {
	Execute(ctx context.Context, name, email string) (string, error)
}
