package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserReadRepository struct {
	collection *mongo.Collection
}

func NewUserReadRepository(db *mongo.Database) *UserReadRepository {
	return &UserReadRepository{
		collection: db.Collection("users"),
	}
}

func (r *UserReadRepository) FindById(ctx context.Context, id string) (any, error) {
	var user map[string]any
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	return user, err
}
