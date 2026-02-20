package repository

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"small-ecommers/internal/domain/entity"
)

// PostgresProductRepository implements ProductRepository interface using PostgreSQL
type PostgresProductRepository struct {
	db *sql.DB
}

// NewPostgresProductRepository creates a new PostgreSQL product repository
func NewPostgresProductRepository(db *sql.DB) *PostgresProductRepository {
	return &PostgresProductRepository{db: db}
}

// Create creates a new product
func (r *PostgresProductRepository) Create(ctx context.Context, product *entity.Product) error {
	query := `
		INSERT INTO products (id, name, description, price, stock, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := r.db.ExecContext(ctx, query,
		product.ID,
		product.Name,
		product.Description,
		product.Price,
		product.Stock,
		product.CreatedAt,
		product.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}

	return nil
}

// GetByID retrieves a product by ID
func (r *PostgresProductRepository) GetByID(ctx context.Context, id string) (*entity.Product, error) {
	query := `
		SELECT id, name, description, price, stock, created_at, updated_at
		FROM products
		WHERE id = $1
	`

	var product entity.Product
	var description sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&product.ID,
		&product.Name,
		&description,
		&product.Price,
		&product.Stock,
		&product.CreatedAt,
		&product.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("product not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}

	if description.Valid {
		product.Description = &description.String
	}

	return &product, nil
}

// List retrieves all products
func (r *PostgresProductRepository) List(ctx context.Context) ([]*entity.Product, error) {
	query := `
		SELECT id, name, description, price, stock, created_at, updated_at
		FROM products
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list products: %w", err)
	}
	defer rows.Close()

	var products []*entity.Product

	for rows.Next() {
		var product entity.Product
		var description sql.NullString

		err := rows.Scan(
			&product.ID,
			&product.Name,
			&description,
			&product.Price,
			&product.Stock,
			&product.CreatedAt,
			&product.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}

		if description.Valid {
			product.Description = &description.String
		}

		products = append(products, &product)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating products: %w", err)
	}

	return products, nil
}

// Update updates an existing product
func (r *PostgresProductRepository) Update(ctx context.Context, product *entity.Product) error {
	query := `
		UPDATE products
		SET name = $1, description = $2, price = $3, stock = $4, updated_at = $5
		WHERE id = $6
	`

	product.UpdatedAt = time.Now()

	result, err := r.db.ExecContext(ctx, query,
		product.Name,
		product.Description,
		product.Price,
		product.Stock,
		product.UpdatedAt,
		product.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update product: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

// Delete deletes a product by ID
func (r *PostgresProductRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM products WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

// UpdateStock updates the stock of a product
func (r *PostgresProductRepository) UpdateStock(ctx context.Context, id string, stock int) error {
	query := `
		UPDATE products
		SET stock = $1, updated_at = $2
		WHERE id = $3
	`

	result, err := r.db.ExecContext(ctx, query, stock, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update product stock: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product not found")
	}

	return nil
}

// GetByIDs retrieves products by multiple IDs
func (r *PostgresProductRepository) GetByIDs(ctx context.Context, ids []string) ([]*entity.Product, error) {
	if len(ids) == 0 {
		return []*entity.Product{}, nil
	}

	placeholders := make([]string, len(ids))
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}

	query := fmt.Sprintf(`
		SELECT id, name, description, price, stock, created_at, updated_at
		FROM products
		WHERE id IN (%s)
		ORDER BY created_at DESC
	`, strings.Join(placeholders, ", "))

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get products by IDs: %w", err)
	}
	defer rows.Close()

	var products []*entity.Product

	for rows.Next() {
		var product entity.Product
		var description sql.NullString

		err := rows.Scan(
			&product.ID,
			&product.Name,
			&description,
			&product.Price,
			&product.Stock,
			&product.CreatedAt,
			&product.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan product: %w", err)
		}

		if description.Valid {
			product.Description = &description.String
		}

		products = append(products, &product)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating products: %w", err)
	}

	return products, nil
}
