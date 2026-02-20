package repository

import (
	"context"

	"small-ecommers/internal/domain/entity"
)

// CartRepository defines the interface for cart data operations
type CartRepository interface {
	// Create creates a new cart
	Create(ctx context.Context, cart *entity.Cart) error

	// GetByID retrieves a cart by ID
	GetByID(ctx context.Context, id string) (*entity.Cart, error)

	// GetByUserID retrieves a cart by user ID
	GetByUserID(ctx context.Context, userID string) (*entity.Cart, error)

	// Update updates an existing cart
	Update(ctx context.Context, cart *entity.Cart) error

	// Delete deletes a cart by ID
	Delete(ctx context.Context, id string) error
}
