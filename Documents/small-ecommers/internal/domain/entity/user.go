package entity

import "time"

// User represents a user entity in the domain
type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Password should not be exposed in JSON
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NewUser creates a new User entity
func NewUser(id, name, email, password string) *User {
	now := time.Now()
	return &User{
		ID:        id,
		Name:      name,
		Email:     email,
		Password:  password,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
