package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

func (r *UserReadRepository) Upsert(ctx context.Context, user UserDocument) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": user.ID},
		bson.M{"$set": user}, options.Update().SetUpsert(true),
	)
	return err
}
