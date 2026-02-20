package repository

import (
	"context"

	"small-ecommers/internal/domain/entity"
)

// OrderRepository defines the interface for order data operations
type OrderRepository interface {
	// Create creates a new order
	Create(ctx context.Context, order *entity.Order) error

	// GetByID retrieves an order by ID
	GetByID(ctx context.Context, id string) (*entity.Order, error)

	// GetByUserID retrieves all orders for a user
	GetByUserID(ctx context.Context, userID string) ([]*entity.Order, error)

	// Update updates an existing order
	Update(ctx context.Context, order *entity.Order) error

	// UpdateStatus updates the status of an order
	UpdateStatus(ctx context.Context, id string, status entity.OrderStatus) error

	// Delete deletes an order by ID
	Delete(ctx context.Context, id string) error

	// List retrieves all orders
	List(ctx context.Context) ([]*entity.Order, error)
}
