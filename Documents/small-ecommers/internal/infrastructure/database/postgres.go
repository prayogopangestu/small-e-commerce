package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
)

// Config holds the database configuration
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// NewPostgresConnection creates a new PostgreSQL connection
func NewPostgresConnection(cfg *Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host,
		cfg.Port,
		cfg.User,
		cfg.Password,
		cfg.DBName,
		cfg.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to PostgreSQL database")

	return db, nil
}

// Migrate runs database migrations
func Migrate(db *sql.DB) error {
	// Create users table
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("failed to create users table: %w", err)
	}

	// Create products table
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS products (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			price DECIMAL(10, 2) NOT NULL,
			stock INTEGER NOT NULL DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("failed to create products table: %w", err)
	}

	// Create carts table
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS carts (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id)
		)
	`); err != nil {
		return fmt.Errorf("failed to create carts table: %w", err)
	}

	// Create cart_items table
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS cart_items (
			id VARCHAR(36) PRIMARY KEY,
			cart_id VARCHAR(36) NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
			product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			quantity INTEGER NOT NULL DEFAULT 1,
			price DECIMAL(10, 2) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(cart_id, product_id)
		)
	`); err != nil {
		return fmt.Errorf("failed to create cart_items table: %w", err)
	}

	// Create orders table
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS orders (
			id VARCHAR(36) PRIMARY KEY,
			user_id VARCHAR(36) NOT NULL,
			total DECIMAL(10, 2) NOT NULL,
			status VARCHAR(50) NOT NULL DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("failed to create orders table: %w", err)
	}

	// Create order_items table
	if _, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS order_items (
			id VARCHAR(36) PRIMARY KEY,
			order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			product_id VARCHAR(36) NOT NULL,
			quantity INTEGER NOT NULL,
			price DECIMAL(10, 2) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("failed to create order_items table: %w", err)
	}

	// Create indexes
	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`); err != nil {
		return fmt.Errorf("failed to create index on users.email: %w", err)
	}

	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`); err != nil {
		return fmt.Errorf("failed to create index on orders.user_id: %w", err)
	}

	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`); err != nil {
		return fmt.Errorf("failed to create index on orders.status: %w", err)
	}

	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)`); err != nil {
		return fmt.Errorf("failed to create index on cart_items.cart_id: %w", err)
	}

	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`); err != nil {
		return fmt.Errorf("failed to create index on order_items.order_id: %w", err)
	}

	log.Println("Database migrations completed successfully")

	return nil
}
