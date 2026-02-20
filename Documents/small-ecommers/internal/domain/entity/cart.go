package entity

import "time"

// Cart represents a shopping cart entity in the domain
type Cart struct {
	ID        string      `json:"id"`
	UserID    string      `json:"user_id"`
	Items     []*CartItem `json:"items"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

// CartItem represents an item in the shopping cart
type CartItem struct {
	ID        string  `json:"id"`
	ProductID string  `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

// NewCart creates a new Cart entity
func NewCart(id, userID string) *Cart {
	now := time.Now()
	return &Cart{
		ID:        id,
		UserID:    userID,
		Items:     make([]*CartItem, 0),
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewCartItem creates a new CartItem
func NewCartItem(id, productID string, quantity int, price float64) *CartItem {
	return &CartItem{
		ID:        id,
		ProductID: productID,
		Quantity:  quantity,
		Price:     price,
	}
}

// AddItem adds an item to the cart
// If the item already exists, it updates the quantity
func (c *Cart) AddItem(item *CartItem) {
	// Check if item already exists in cart
	for _, existingItem := range c.Items {
		if existingItem.ProductID == item.ProductID {
			existingItem.Quantity += item.Quantity
			c.UpdatedAt = time.Now()
			return
		}
	}

	// Add new item
	c.Items = append(c.Items, item)
	c.UpdatedAt = time.Now()
}

// RemoveItem removes an item from the cart by product ID
func (c *Cart) RemoveItem(productID string) error {
	for i, item := range c.Items {
		if item.ProductID == productID {
			c.Items = append(c.Items[:i], c.Items[i+1:]...)
			c.UpdatedAt = time.Now()
			return nil
		}
	}
	return ErrCartItemNotFound
}

// UpdateItemQuantity updates the quantity of an item in the cart
func (c *Cart) UpdateItemQuantity(productID string, quantity int) error {
	for _, item := range c.Items {
		if item.ProductID == productID {
			item.Quantity = quantity
			c.UpdatedAt = time.Now()
			return nil
		}
	}
	return ErrCartItemNotFound
}

// Clear removes all items from the cart
func (c *Cart) Clear() {
	c.Items = make([]*CartItem, 0)
	c.UpdatedAt = time.Now()
}

// GetTotal calculates the total price of all items in the cart
func (c *Cart) GetTotal() float64 {
	total := 0.0
	for _, item := range c.Items {
		total += item.Price * float64(item.Quantity)
	}
	return total
}

// GetItemCount returns the total number of items in the cart
func (c *Cart) GetItemCount() int {
	count := 0
	for _, item := range c.Items {
		count += item.Quantity
	}
	return count
}
