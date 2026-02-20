# Small E-Commerce

A small e-commerce application built with Go, Fiber, PostgreSQL, and Kafka following Clean Architecture principles.

## Tech Stack

- **Language**: Golang
- **Web Framework**: Fiber
- **Database**: PostgreSQL
- **Message Broker**: Kafka
- **Architecture**: Clean Architecture

## Features

- User Authentication (Register, Login)
- Product Catalog (CRUD operations)
- Shopping Cart (Add, Remove, Update items)
- Order Management (Create, Pay, Cancel orders)
- Event-driven architecture with Kafka

## Project Structure

```
small-ecommers/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── domain/
│   │   ├── entity/              # Domain entities
│   │   └── repository/          # Repository interfaces
│   ├── usecase/                 # Business logic
│   ├── handler/                 # HTTP handlers
│   ├── infrastructure/          # External dependencies
│   │   ├── database/            # PostgreSQL
│   │   └── kafka/               # Kafka producer/consumer
│   └── middleware/              # Fiber middleware
├── pkg/
│   ├── config/                  # Configuration
│   ├── logger/                  # Logging utilities
│   └── utils/                   # Utility functions
├── configs/                     # Configuration files
├── docker-compose.yml           # Docker services
├── Dockerfile                  # Application Docker image
├── go.mod                      # Go module file
└── go.sum                      # Go module checksums
```

## Getting Started

### Prerequisites

- Go 1.24 or higher
- Docker and Docker Compose
- PostgreSQL
- Kafka

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd small-ecommers
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Start the services:
```bash
docker-compose up -d
```

4. Run the application:
```bash
go run cmd/api/main.go
```

Or build and run:
```bash
go build -o bin/api cmd/api/main.go
./bin/api
```

### Using Docker

Build the Docker image:
```bash
docker build -t small-ecommers .
```

Run with Docker Compose:
```bash
docker-compose up -d
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login

### Products

- `GET /api/v1/products` - List all products
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create a new product
- `PUT /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product

### Cart

- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `DELETE /api/v1/cart/items/:id` - Remove item from cart
- `PUT /api/v1/cart/items/:id` - Update item quantity
- `POST /api/v1/cart/clear` - Clear cart

### Orders

- `POST /api/v1/orders` - Create order from cart
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get order by ID
- `POST /api/v1/orders/:id/pay` - Pay order
- `POST /api/v1/orders/:id/cancel` - Cancel order
- `PUT /api/v1/orders/:id/status` - Update order status

### Users

- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get user by ID

## Authentication

For protected endpoints, include the `X-User-ID` header or `Authorization: Bearer <token>` header.

## Kafka Topics

- `order.created` - Published when a new order is created

## Development

### Running Tests

```bash
go test ./...
```

### Building

```bash
go build -o bin/api cmd/api/main.go
```

### Linting

```bash
golangci-lint run
```

## Architecture

This project follows Clean Architecture principles:

1. **Domain Layer**: Contains business entities and repository interfaces
2. **Use Case Layer**: Contains business logic and application rules
3. **Handler Layer**: Handles HTTP requests and responses
4. **Infrastructure Layer**: Implements external dependencies (database, message broker)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
