package outbound

import "context"

type UserReadRepository interface {
	FindById(ctx context.Context, id string) (any, error)
}
