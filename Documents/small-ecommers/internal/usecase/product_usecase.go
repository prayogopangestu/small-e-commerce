package usecase

import (
	"context"

	"github.com/google/uuid"

	"small-ecommers/internal/domain/entity"
	"small-ecommers/internal/domain/repository"
)

// ProductUseCase defines the business logic for product operations
type ProductUseCase struct {
	productRepo repository.ProductRepository
}

// NewProductUseCase creates a new ProductUseCase
func NewProductUseCase(productRepo repository.ProductRepository) *ProductUseCase {
	return &ProductUseCase{
		productRepo: productRepo,
	}
}

// CreateProductRequest represents the request to create a product
type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
}

// UpdateProductRequest represents the request to update a product
type UpdateProductRequest struct {
	Name        *string  `json:"name,omitempty"`
	Description *string  `json:"description,omitempty"`
	Price       *float64 `json:"price,omitempty"`
	Stock       *int     `json:"stock,omitempty"`
}

// CreateProduct creates a new product
func (uc *ProductUseCase) CreateProduct(ctx context.Context, req *CreateProductRequest) (*entity.Product, error) {
	product := entity.NewProduct(
		uuid.New().String(),
		req.Name,
		req.Description,
		req.Price,
		req.Stock,
	)

	if err := uc.productRepo.Create(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

// GetProduct retrieves a product by ID
func (uc *ProductUseCase) GetProduct(ctx context.Context, id string) (*entity.Product, error) {
	return uc.productRepo.GetByID(ctx, id)
}

// ListProducts retrieves all products
func (uc *ProductUseCase) ListProducts(ctx context.Context) ([]*entity.Product, error) {
	return uc.productRepo.List(ctx)
}

// UpdateProduct updates an existing product
func (uc *ProductUseCase) UpdateProduct(ctx context.Context, id string, req *UpdateProductRequest) (*entity.Product, error) {
	product, err := uc.productRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = req.Description
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}

	if err := uc.productRepo.Update(ctx, product); err != nil {
		return nil, err
	}

	return product, nil
}

// DeleteProduct deletes a product by ID
func (uc *ProductUseCase) DeleteProduct(ctx context.Context, id string) error {
	return uc.productRepo.Delete(ctx, id)
}

// GetProductsByIDs retrieves products by multiple IDs
func (uc *ProductUseCase) GetProductsByIDs(ctx context.Context, ids []string) ([]*entity.Product, error) {
	return uc.productRepo.GetByIDs(ctx, ids)
}
