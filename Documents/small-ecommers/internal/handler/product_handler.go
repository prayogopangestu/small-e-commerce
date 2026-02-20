package handler

import (
	"small-ecommers/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

// ProductHandler handles HTTP requests for product operations
type ProductHandler struct {
	productUseCase *usecase.ProductUseCase
}

// NewProductHandler creates a new ProductHandler
func NewProductHandler(productUseCase *usecase.ProductUseCase) *ProductHandler {
	return &ProductHandler{
		productUseCase: productUseCase,
	}
}

// CreateProduct handles creating a new product
// @Summary Create a new product
// @Description Create a new product with name, description, price, and stock
// @Tags products
// @Accept json
// @Produce json
// @Param request body usecase.CreateProductRequest true "Create product request"
// @Success 201 {object} entity.Product
// @Failure 400 {object} map[string]string
// @Router /api/v1/products [post]
func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var req usecase.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Name == "" || req.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name and valid price are required",
		})
	}

	if req.Stock < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Stock cannot be negative",
		})
	}

	product, err := h.productUseCase.CreateProduct(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(product)
}

// GetProduct handles getting a product by ID
// @Summary Get product by ID
// @Description Get a product by its ID
// @Tags products
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} entity.Product
// @Failure 404 {object} map[string]string
// @Router /api/v1/products/{id} [get]
func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Product ID is required",
		})
	}

	product, err := h.productUseCase.GetProduct(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(product)
}

// ListProducts handles listing all products
// @Summary List all products
// @Description Get a list of all products
// @Tags products
// @Produce json
// @Success 200 {array} entity.Product
// @Router /api/v1/products [get]
func (h *ProductHandler) ListProducts(c *fiber.Ctx) error {
	products, err := h.productUseCase.ListProducts(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(products)
}

// UpdateProduct handles updating a product
// @Summary Update a product
// @Description Update an existing product
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param request body usecase.UpdateProductRequest true "Update product request"
// @Success 200 {object} entity.Product
// @Failure 400 {object} map[string]string
// @Router /api/v1/products/{id} [put]
func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Product ID is required",
		})
	}

	var req usecase.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate price if provided
	if req.Price != nil && *req.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Price must be greater than 0",
		})
	}

	// Validate stock if provided
	if req.Stock != nil && *req.Stock < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Stock cannot be negative",
		})
	}

	product, err := h.productUseCase.UpdateProduct(c.Context(), id, &req)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(product)
}

// DeleteProduct handles deleting a product
// @Summary Delete a product
// @Description Delete a product by ID
// @Tags products
// @Param id path string true "Product ID"
// @Success 204
// @Failure 404 {object} map[string]string
// @Router /api/v1/products/{id} [delete]
func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Product ID is required",
		})
	}

	if err := h.productUseCase.DeleteProduct(c.Context(), id); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
