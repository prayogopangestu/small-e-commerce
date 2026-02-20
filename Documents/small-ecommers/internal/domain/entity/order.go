package entity

import "time"

// OrderStatus represents the status of an order
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusPaid      OrderStatus = "paid"
	OrderStatusShipped   OrderStatus = "shipped"
	OrderStatusCompleted OrderStatus = "completed"
	OrderStatusCancelled OrderStatus = "cancelled"
)

// Order represents an order entity in the domain
type Order struct {
	ID        string       `json:"id"`
	UserID    string       `json:"user_id"`
	Items     []*OrderItem `json:"items"`
	Total     float64      `json:"total"`
	Status    OrderStatus  `json:"status"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID        string  `json:"id"`
	ProductID string  `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

// NewOrder creates a new Order entity
func NewOrder(id, userID string, items []*OrderItem, total float64) *Order {
	now := time.Now()
	return &Order{
		ID:        id,
		UserID:    userID,
		Items:     items,
		Total:     total,
		Status:    OrderStatusPending,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewOrderItem creates a new OrderItem
func NewOrderItem(id, productID string, quantity int, price float64) *OrderItem {
	return &OrderItem{
		ID:        id,
		ProductID: productID,
		Quantity:  quantity,
		Price:     price,
	}
}

// UpdateStatus updates the order status
func (o *Order) UpdateStatus(status OrderStatus) {
	o.Status = status
	o.UpdatedAt = time.Now()
}

// CanBePaid checks if the order can be paid
func (o *Order) CanBePaid() bool {
	return o.Status == OrderStatusPending
}

// CanBeShipped checks if the order can be shipped
func (o *Order) CanBeShipped() bool {
	return o.Status == OrderStatusPaid
}

// CanBeCancelled checks if the order can be cancelled
func (o *Order) CanBeCancelled() bool {
	return o.Status == OrderStatusPending || o.Status == OrderStatusPaid
}

// Cancel cancels the order
func (o *Order) Cancel() error {
	if !o.CanBeCancelled() {
		return ErrInvalidOrder
	}
	o.Status = OrderStatusCancelled
	o.UpdatedAt = time.Now()
	return nil
}

// MarkAsPaid marks the order as paid
func (o *Order) MarkAsPaid() error {
	if !o.CanBePaid() {
		return ErrInvalidOrder
	}
	o.Status = OrderStatusPaid
	o.UpdatedAt = time.Now()
	return nil
}

// MarkAsShipped marks the order as shipped
func (o *Order) MarkAsShipped() error {
	if !o.CanBeShipped() {
		return ErrInvalidOrder
	}
	o.Status = OrderStatusShipped
	o.UpdatedAt = time.Now()
	return nil
}

// MarkAsCompleted marks the order as completed
func (o *Order) MarkAsCompleted() {
	o.Status = OrderStatusCompleted
	o.UpdatedAt = time.Now()
}

// GetItemCount returns the total number of items in the order
func (o *Order) GetItemCount() int {
	count := 0
	for _, item := range o.Items {
		count += item.Quantity
	}
	return count
}
