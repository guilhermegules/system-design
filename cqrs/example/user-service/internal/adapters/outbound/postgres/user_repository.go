package postgres

import (
	"context"
	"userservice/internal/domain"

	"gorm.io/gorm"
)

type UserModel struct {
	ID    string `gorm:"primaryKey;type:uuid"`
	Name  string
	Email string
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db}
}

func (r *UserRepository) Create(ctx context.Context, user domain.User) error {
	return r.db.WithContext(ctx).Create(&UserModel{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}).Error
}
