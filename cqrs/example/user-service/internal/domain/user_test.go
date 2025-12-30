package domain

import (
	"testing"
	"time"
)

func TestUser_IsValidUser(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name     string
		user     User
		expected bool
	}{
		{
			name: "valid user",
			user: User{
				ID:        "1",
				Name:      "John Doe",
				Email:     "john@doe.com",
				CreatedAt: now,
				UpdatedAt: now,
			},
			expected: true,
		},
		{
			name: "invalid user - empty name",
			user: User{
				ID:        "2",
				Name:      "",
				Email:     "john@doe.com",
				CreatedAt: now,
				UpdatedAt: now,
			},
			expected: false,
		},
		{
			name: "invalid user - empty email",
			user: User{
				ID:        "3",
				Name:      "John Doe",
				Email:     "",
				CreatedAt: now,
				UpdatedAt: now,
			},
			expected: false,
		},
		{
			name: "invalid user - empty name and email",
			user: User{
				ID:        "4",
				Name:      "",
				Email:     "",
				CreatedAt: now,
				UpdatedAt: now,
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.user.IsValidUser()
			if result != tt.expected {
				t.Fatalf(
					"IsValidUser() = %v, expected %v",
					result,
					tt.expected,
				)
			}
		})
	}
}
