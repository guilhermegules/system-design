package domain

import "time"

type User struct {
	ID        string
	Name      string
	Email     string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (u *User) IsValidUser() bool {
	if u.Name == "" || u.Email == "" {
		return false
	}

	return true
}
