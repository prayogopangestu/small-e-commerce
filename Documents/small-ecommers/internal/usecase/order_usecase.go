package usecase

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"small-ecommers/internal/domain/entity"
	"small-ecommers/internal/domain/repository"
)

// OrderUseCase defines the business logic for order operations
type OrderUseCase struct {
	orderRepo     repository.OrderRepository
	cartRepo      repository.CartRepository
	productRepo   repository.ProductRepository
	kafkaProducer KafkaProducer
}

// KafkaProducer defines the interface for Kafka producer operations
type KafkaProducer interface {
	PublishOrderCreated(ctx context.Context, order map[string]interface{}) error
}

// NewOrderUseCase creates a new OrderUseCase
func NewOrderUseCase(
	orderRepo repository.OrderRepository,
	cartRepo repository.CartRepository,
	productRepo repository.ProductRepository,
	kafkaProducer KafkaProducer,
) *OrderUseCase {
	return &OrderUseCase{
		orderRepo:     orderRepo,
		cartRepo:      cartRepo,
		productRepo:   productRepo,
		kafkaProducer: kafkaProducer,
	}
}

// CreateOrderRequest represents the request to create an order
type CreateOrderRequest struct {
	Items []CreateOrderItemRequest `json:"items"`
}

// CreateOrderItemRequest represents an item in the create order request
type CreateOrderItemRequest struct {
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
}

// CreateOrder creates a new order from cart items
func (uc *OrderUseCase) CreateOrder(ctx context.Context, userID string) (*entity.Order, error) {
	// Get user's cart
	cart, err := uc.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if len(cart.Items) == 0 {
		return nil, fmt.Errorf("cart is empty")
	}

	// Get product IDs
	productIDs := make([]string, len(cart.Items))
	for i, item := range cart.Items {
		productIDs[i] = item.ProductID
	}

	// Get products
	products, err := uc.productRepo.GetByIDs(ctx, productIDs)
	if err != nil {
		return nil, err
	}

	// Create product map
	productMap := make(map[string]*entity.Product)
	for _, product := range products {
		productMap[product.ID] = product
	}

	// Create order items
	orderItems := make([]*entity.OrderItem, len(cart.Items))
	total := 0.0

	for i, cartItem := range cart.Items {
		product, exists := productMap[cartItem.ProductID]
		if !exists {
			return nil, fmt.Errorf("product not found: %s", cartItem.ProductID)
		}

		// Check stock
		if !product.HasStock(cartItem.Quantity) {
			return nil, fmt.Errorf("insufficient stock for product: %s", product.Name)
		}

		orderItems[i] = entity.NewOrderItem(
			uuid.New().String(),
			cartItem.ProductID,
			cartItem.Quantity,
			cartItem.Price,
		)

		total += cartItem.Price * float64(cartItem.Quantity)
	}

	// Create order
	order := entity.NewOrder(uuid.New().String(), userID, orderItems, total)

	// Save order
	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	// Publish order created event to Kafka
	orderEvent := map[string]interface{}{
		"id":      order.ID,
		"user_id": order.UserID,
		"total":   order.Total,
		"status":  order.Status,
		"items":   order.Items,
	}

	if uc.kafkaProducer != nil {
		if err := uc.kafkaProducer.PublishOrderCreated(ctx, orderEvent); err != nil {
			// Log error but don't fail the order creation
			fmt.Printf("Failed to publish order event: %v\n", err)
		}
	}

	// Clear cart
	cart.Clear()
	if err := uc.cartRepo.Update(ctx, cart); err != nil {
		// Log error but don't fail the order creation
		fmt.Printf("Failed to clear cart: %v\n", err)
	}

	return order, nil
}

// GetOrder retrieves an order by ID
func (uc *OrderUseCase) GetOrder(ctx context.Context, id string) (*entity.Order, error) {
	return uc.orderRepo.GetByID(ctx, id)
}

// GetUserOrders retrieves all orders for a user
func (uc *OrderUseCase) GetUserOrders(ctx context.Context, userID string) ([]*entity.Order, error) {
	return uc.orderRepo.GetByUserID(ctx, userID)
}

// UpdateOrderStatus updates the status of an order
func (uc *OrderUseCase) UpdateOrderStatus(ctx context.Context, id string, status entity.OrderStatus) (*entity.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	order.UpdateStatus(status)

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// PayOrder marks an order as paid
func (uc *OrderUseCase) PayOrder(ctx context.Context, id string) (*entity.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := order.MarkAsPaid(); err != nil {
		return nil, err
	}

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// CancelOrder cancels an order
func (uc *OrderUseCase) CancelOrder(ctx context.Context, id string) (*entity.Order, error) {
	order, err := uc.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if err := order.Cancel(); err != nil {
		return nil, err
	}

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}
