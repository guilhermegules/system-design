package outbound

import (
	"context"
	"userservice/internal/domain"
)

type UserWriteRepository interface {
	Create(ctx context.Context, user domain.User) error
}
