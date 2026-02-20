package usecase

import (
	"context"

	"github.com/google/uuid"

	"small-ecommers/internal/domain/entity"
	"small-ecommers/internal/domain/repository"
)

// CartUseCase defines the business logic for cart operations
type CartUseCase struct {
	cartRepo    repository.CartRepository
	productRepo repository.ProductRepository
}

// NewCartUseCase creates a new CartUseCase
func NewCartUseCase(cartRepo repository.CartRepository, productRepo repository.ProductRepository) *CartUseCase {
	return &CartUseCase{
		cartRepo:    cartRepo,
		productRepo: productRepo,
	}
}

// AddItemRequest represents the request to add an item to the cart
type AddItemRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

// GetOrCreateCart gets an existing cart or creates a new one for the user
func (uc *CartUseCase) GetOrCreateCart(ctx context.Context, userID string) (*entity.Cart, error) {
	cart, err := uc.cartRepo.GetByUserID(ctx, userID)
	if err == nil && cart != nil {
		return cart, nil
	}

	// Create new cart
	cart = entity.NewCart(uuid.New().String(), userID)
	if err := uc.cartRepo.Create(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}

// GetCart retrieves a cart by user ID
func (uc *CartUseCase) GetCart(ctx context.Context, userID string) (*entity.Cart, error) {
	return uc.cartRepo.GetByUserID(ctx, userID)
}

// AddItem adds an item to the cart
func (uc *CartUseCase) AddItem(ctx context.Context, userID string, req *AddItemRequest) (*entity.Cart, error) {
	// Get or create cart
	cart, err := uc.GetOrCreateCart(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Get product
	product, err := uc.productRepo.GetByID(ctx, req.ProductID)
	if err != nil {
		return nil, err
	}

	// Check stock
	if !product.HasStock(req.Quantity) {
		return nil, entity.ErrInsufficientStock
	}

	// Create cart item
	cartItem := entity.NewCartItem(
		uuid.New().String(),
		req.ProductID,
		req.Quantity,
		product.Price,
	)

	// Add item to cart
	cart.AddItem(cartItem)

	// Save cart
	if err := uc.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}

// RemoveItem removes an item from the cart
func (uc *CartUseCase) RemoveItem(ctx context.Context, userID, productID string) (*entity.Cart, error) {
	cart, err := uc.GetCart(ctx, userID)
	if err != nil {
		return nil, err
	}

	if err := cart.RemoveItem(productID); err != nil {
		return nil, err
	}

	if err := uc.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}

// UpdateItemQuantity updates the quantity of an item in the cart
func (uc *CartUseCase) UpdateItemQuantity(ctx context.Context, userID, productID string, quantity int) (*entity.Cart, error) {
	cart, err := uc.GetCart(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Get product to check stock
	product, err := uc.productRepo.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	if !product.HasStock(quantity) {
		return nil, entity.ErrInsufficientStock
	}

	if err := cart.UpdateItemQuantity(productID, quantity); err != nil {
		return nil, err
	}

	if err := uc.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}

// ClearCart clears all items from the cart
func (uc *CartUseCase) ClearCart(ctx context.Context, userID string) (*entity.Cart, error) {
	cart, err := uc.GetCart(ctx, userID)
	if err != nil {
		return nil, err
	}

	cart.Clear()

	if err := uc.cartRepo.Update(ctx, cart); err != nil {
		return nil, err
	}

	return cart, nil
}
