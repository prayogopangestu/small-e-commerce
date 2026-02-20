package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"small-ecommers/internal/handler"
	"small-ecommers/internal/infrastructure/database"
	"small-ecommers/internal/infrastructure/kafka"
	"small-ecommers/internal/infrastructure/repository"
	"small-ecommers/internal/middleware"
	"small-ecommers/internal/usecase"
	"small-ecommers/pkg/config"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	db, err := database.NewPostgresConnection(&database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Connect to Kafka
	kafkaProducer, err := kafka.NewProducer(cfg.Kafka.Brokers)
	if err != nil {
		log.Printf("Warning: Failed to connect to Kafka: %v", err)
		kafkaProducer = nil
	}
	if kafkaProducer != nil {
		defer kafkaProducer.Close()
	}

	// Initialize repositories
	userRepo := repository.NewPostgresUserRepository(db)
	productRepo := repository.NewPostgresProductRepository(db)
	cartRepo := repository.NewPostgresCartRepository(db)
	orderRepo := repository.NewPostgresOrderRepository(db)

	// Initialize use cases
	userUseCase := usecase.NewUserUseCase(userRepo)
	productUseCase := usecase.NewProductUseCase(productRepo)
	cartUseCase := usecase.NewCartUseCase(cartRepo, productRepo)
	orderUseCase := usecase.NewOrderUseCase(orderRepo, cartRepo, productRepo, kafkaProducer)

	// Initialize handlers
	userHandler := handler.NewUserHandler(userUseCase)
	productHandler := handler.NewProductHandler(productUseCase)
	cartHandler := handler.NewCartHandler(cartUseCase)
	orderHandler := handler.NewOrderHandler(orderUseCase)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
	})

	// Middleware
	app.Use(middleware.Logger())
	app.Use(middleware.Recovery())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// API Routes
	api := app.Group("/api/v1")

	// Public routes
	api.Post("/auth/register", userHandler.Register)
	api.Post("/auth/login", userHandler.Login)

	// Protected routes
	auth := api.Group("")
	auth.Use(middleware.AuthRequired())

	// Products
	auth.Get("/products", productHandler.ListProducts)
	auth.Get("/products/:id", productHandler.GetProduct)
	auth.Post("/products", productHandler.CreateProduct)
	auth.Put("/products/:id", productHandler.UpdateProduct)
	auth.Delete("/products/:id", productHandler.DeleteProduct)

	// Cart
	auth.Get("/cart", cartHandler.GetCart)
	auth.Post("/cart/items", cartHandler.AddItem)
	auth.Delete("/cart/items/:id", cartHandler.RemoveItem)
	auth.Put("/cart/items/:id", cartHandler.UpdateItemQuantity)
	auth.Post("/cart/clear", cartHandler.ClearCart)

	// Orders
	auth.Post("/orders", orderHandler.CreateOrder)
	auth.Get("/orders", orderHandler.GetUserOrders)
	auth.Get("/orders/:id", orderHandler.GetOrder)
	auth.Post("/orders/:id/pay", orderHandler.PayOrder)
	auth.Post("/orders/:id/cancel", orderHandler.CancelOrder)
	auth.Put("/orders/:id/status", orderHandler.UpdateOrderStatus)

	// Users
	auth.Get("/users", userHandler.ListUsers)
	auth.Get("/users/:id", userHandler.GetUser)

	// Start server
	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := app.Listen(":" + cfg.Server.Port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	if err := app.Shutdown(); err != nil {
		log.Printf("Error during shutdown: %v", err)
	}
}
