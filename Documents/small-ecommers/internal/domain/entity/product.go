package entity

import (
	"time"
)

// Product represents a product entity in the domain
type Product struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description,omitempty"` // Optional field, can be nil
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NewProduct creates a new Product entity
func NewProduct(id, name string, description *string, price float64, stock int) *Product {
	now := time.Now()
	return &Product{
		ID:          id,
		Name:        name,
		Description: description,
		Price:       price,
		Stock:       stock,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// HasStock checks if product has enough stock
func (p *Product) HasStock(quantity int) bool {
	return p.Stock >= quantity
}

// ReduceStock reduces the product stock by the given quantity
// Returns error if not enough stock
func (p *Product) ReduceStock(quantity int) error {
	if !p.HasStock(quantity) {
		return ErrInsufficientStock
	}
	p.Stock -= quantity
	p.UpdatedAt = time.Now()
	return nil
}

// AddStock increases the product stock by the given quantity
func (p *Product) AddStock(quantity int) {
	p.Stock += quantity
	p.UpdatedAt = time.Now()
}
