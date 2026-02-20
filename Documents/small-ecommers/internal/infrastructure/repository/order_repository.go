package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"small-ecommers/internal/domain/entity"
)

// PostgresOrderRepository implements OrderRepository interface using PostgreSQL
type PostgresOrderRepository struct {
	db *sql.DB
}

// NewPostgresOrderRepository creates a new PostgreSQL order repository
func NewPostgresOrderRepository(db *sql.DB) *PostgresOrderRepository {
	return &PostgresOrderRepository{db: db}
}

// Create creates a new order
func (r *PostgresOrderRepository) Create(ctx context.Context, order *entity.Order) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert order
	query := `
		INSERT INTO orders (id, user_id, total, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err = tx.ExecContext(ctx, query,
		order.ID,
		order.UserID,
		order.Total,
		order.Status,
		order.CreatedAt,
		order.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create order: %w", err)
	}

	// Insert order items
	for _, item := range order.Items {
		itemQuery := `
			INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`

		_, err = tx.ExecContext(ctx, itemQuery,
			item.ID,
			order.ID,
			item.ProductID,
			item.Quantity,
			item.Price,
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to create order item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetByID retrieves an order by ID
func (r *PostgresOrderRepository) GetByID(ctx context.Context, id string) (*entity.Order, error) {
	query := `
		SELECT id, user_id, total, status, created_at, updated_at
		FROM orders
		WHERE id = $1
	`

	var order entity.Order

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&order.ID,
		&order.UserID,
		&order.Total,
		&order.Status,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("order not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	// Get order items
	items, err := r.getOrderItems(ctx, order.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get order items: %w", err)
	}

	order.Items = items

	return &order, nil
}

// GetByUserID retrieves all orders for a user
func (r *PostgresOrderRepository) GetByUserID(ctx context.Context, userID string) ([]*entity.Order, error) {
	query := `
		SELECT id, user_id, total, status, created_at, updated_at
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}
	defer rows.Close()

	var orders []*entity.Order

	for rows.Next() {
		var order entity.Order

		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.Total,
			&order.Status,
			&order.CreatedAt,
			&order.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}

		// Get order items
		items, err := r.getOrderItems(ctx, order.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get order items: %w", err)
		}

		order.Items = items

		orders = append(orders, &order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// Update updates an existing order
func (r *PostgresOrderRepository) Update(ctx context.Context, order *entity.Order) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update order
	query := `
		UPDATE orders
		SET total = $1, status = $2, updated_at = $3
		WHERE id = $4
	`

	order.UpdatedAt = time.Now()

	result, err := tx.ExecContext(ctx, query, order.Total, order.Status, order.UpdatedAt, order.ID)
	if err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}

	// Delete existing order items
	deleteItemsQuery := `DELETE FROM order_items WHERE order_id = $1`
	_, err = tx.ExecContext(ctx, deleteItemsQuery, order.ID)
	if err != nil {
		return fmt.Errorf("failed to delete order items: %w", err)
	}

	// Insert new order items
	for _, item := range order.Items {
		itemQuery := `
			INSERT INTO order_items (id, order_id, product_id, quantity, price, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`

		_, err = tx.ExecContext(ctx, itemQuery,
			item.ID,
			order.ID,
			item.ProductID,
			item.Quantity,
			item.Price,
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to create order item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// UpdateStatus updates the status of an order
func (r *PostgresOrderRepository) UpdateStatus(ctx context.Context, id string, status entity.OrderStatus) error {
	query := `
		UPDATE orders
		SET status = $1, updated_at = $2
		WHERE id = $3
	`

	result, err := r.db.ExecContext(ctx, query, status, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}

	return nil
}

// Delete deletes an order by ID
func (r *PostgresOrderRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM orders WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete order: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("order not found")
	}

	return nil
}

// List retrieves all orders
func (r *PostgresOrderRepository) List(ctx context.Context) ([]*entity.Order, error) {
	query := `
		SELECT id, user_id, total, status, created_at, updated_at
		FROM orders
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders: %w", err)
	}
	defer rows.Close()

	var orders []*entity.Order

	for rows.Next() {
		var order entity.Order

		err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.Total,
			&order.Status,
			&order.CreatedAt,
			&order.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}

		// Get order items
		items, err := r.getOrderItems(ctx, order.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get order items: %w", err)
		}

		order.Items = items

		orders = append(orders, &order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating orders: %w", err)
	}

	return orders, nil
}

// getOrderItems retrieves all items for an order
func (r *PostgresOrderRepository) getOrderItems(ctx context.Context, orderID string) ([]*entity.OrderItem, error) {
	query := `
		SELECT id, product_id, quantity, price
		FROM order_items
		WHERE order_id = $1
		ORDER BY created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get order items: %w", err)
	}
	defer rows.Close()

	var items []*entity.OrderItem

	for rows.Next() {
		var item entity.OrderItem

		err := rows.Scan(
			&item.ID,
			&item.ProductID,
			&item.Quantity,
			&item.Price,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan order item: %w", err)
		}

		items = append(items, &item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating order items: %w", err)
	}

	return items, nil
}
