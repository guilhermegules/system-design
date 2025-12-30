package outbound

import (
	"context"
	"userservice/internal/adapters/outbound/mongo"
)

type UserReadRepository interface {
	FindById(ctx context.Context, id string) (mongo.UserDocument, error)
}
