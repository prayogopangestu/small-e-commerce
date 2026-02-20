package repository

import (
	"context"

	"small-ecommers/internal/domain/entity"
)

// ProductRepository defines the interface for product data operations
type ProductRepository interface {
	// Create creates a new product
	Create(ctx context.Context, product *entity.Product) error

	// GetByID retrieves a product by ID
	GetByID(ctx context.Context, id string) (*entity.Product, error)

	// List retrieves all products
	List(ctx context.Context) ([]*entity.Product, error)

	// Update updates an existing product
	Update(ctx context.Context, product *entity.Product) error

	// Delete deletes a product by ID
	Delete(ctx context.Context, id string) error

	// UpdateStock updates the stock of a product
	UpdateStock(ctx context.Context, id string, stock int) error

	// GetByIDs retrieves products by multiple IDs
	GetByIDs(ctx context.Context, ids []string) ([]*entity.Product, error)
}
