package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"small-ecommers/internal/domain/entity"
)

// PostgresCartRepository implements CartRepository interface using PostgreSQL
type PostgresCartRepository struct {
	db *sql.DB
}

// NewPostgresCartRepository creates a new PostgreSQL cart repository
func NewPostgresCartRepository(db *sql.DB) *PostgresCartRepository {
	return &PostgresCartRepository{db: db}
}

// Create creates a new cart
func (r *PostgresCartRepository) Create(ctx context.Context, cart *entity.Cart) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert cart
	query := `
		INSERT INTO carts (id, user_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4)
	`

	_, err = tx.ExecContext(ctx, query,
		cart.ID,
		cart.UserID,
		cart.CreatedAt,
		cart.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create cart: %w", err)
	}

	// Insert cart items
	for _, item := range cart.Items {
		itemQuery := `
			INSERT INTO cart_items (id, cart_id, product_id, quantity, price, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`

		_, err = tx.ExecContext(ctx, itemQuery,
			item.ID,
			cart.ID,
			item.ProductID,
			item.Quantity,
			item.Price,
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to create cart item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// GetByID retrieves a cart by ID
func (r *PostgresCartRepository) GetByID(ctx context.Context, id string) (*entity.Cart, error) {
	query := `
		SELECT id, user_id, created_at, updated_at
		FROM carts
		WHERE id = $1
	`

	var cart entity.Cart

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&cart.ID,
		&cart.UserID,
		&cart.CreatedAt,
		&cart.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("cart not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}

	// Get cart items
	items, err := r.getCartItems(ctx, cart.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart items: %w", err)
	}

	cart.Items = items

	return &cart, nil
}

// GetByUserID retrieves a cart by user ID
func (r *PostgresCartRepository) GetByUserID(ctx context.Context, userID string) (*entity.Cart, error) {
	query := `
		SELECT id, user_id, created_at, updated_at
		FROM carts
		WHERE user_id = $1
	`

	var cart entity.Cart

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&cart.ID,
		&cart.UserID,
		&cart.CreatedAt,
		&cart.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("cart not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get cart: %w", err)
	}

	// Get cart items
	items, err := r.getCartItems(ctx, cart.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart items: %w", err)
	}

	cart.Items = items

	return &cart, nil
}

// Update updates an existing cart
func (r *PostgresCartRepository) Update(ctx context.Context, cart *entity.Cart) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update cart
	query := `
		UPDATE carts
		SET updated_at = $1
		WHERE id = $2
	`

	cart.UpdatedAt = time.Now()

	result, err := tx.ExecContext(ctx, query, cart.UpdatedAt, cart.ID)
	if err != nil {
		return fmt.Errorf("failed to update cart: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("cart not found")
	}

	// Delete existing cart items
	deleteItemsQuery := `DELETE FROM cart_items WHERE cart_id = $1`
	_, err = tx.ExecContext(ctx, deleteItemsQuery, cart.ID)
	if err != nil {
		return fmt.Errorf("failed to delete cart items: %w", err)
	}

	// Insert new cart items
	for _, item := range cart.Items {
		itemQuery := `
			INSERT INTO cart_items (id, cart_id, product_id, quantity, price, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (cart_id, product_id) 
			DO UPDATE SET quantity = EXCLUDED.quantity, price = EXCLUDED.price
		`

		_, err = tx.ExecContext(ctx, itemQuery,
			item.ID,
			cart.ID,
			item.ProductID,
			item.Quantity,
			item.Price,
			time.Now(),
		)

		if err != nil {
			return fmt.Errorf("failed to create cart item: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

// Delete deletes a cart by ID
func (r *PostgresCartRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM carts WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete cart: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("cart not found")
	}

	return nil
}

// getCartItems retrieves all items for a cart
func (r *PostgresCartRepository) getCartItems(ctx context.Context, cartID string) ([]*entity.CartItem, error) {
	query := `
		SELECT id, product_id, quantity, price
		FROM cart_items
		WHERE cart_id = $1
		ORDER BY created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, cartID)
	if err != nil {
		return nil, fmt.Errorf("failed to get cart items: %w", err)
	}
	defer rows.Close()

	var items []*entity.CartItem

	for rows.Next() {
		var item entity.CartItem

		err := rows.Scan(
			&item.ID,
			&item.ProductID,
			&item.Quantity,
			&item.Price,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan cart item: %w", err)
		}

		items = append(items, &item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating cart items: %w", err)
	}

	return items, nil
}
