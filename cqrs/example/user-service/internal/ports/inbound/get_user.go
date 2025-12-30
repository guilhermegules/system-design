package inbound

import "context"

type GetUserUseCase interface {
	Execute(ctx context.Context, id string) (any, error)
}
