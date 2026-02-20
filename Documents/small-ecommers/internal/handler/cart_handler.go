package handler

import (
	"strconv"

	"small-ecommers/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

// CartHandler handles HTTP requests for cart operations
type CartHandler struct {
	cartUseCase *usecase.CartUseCase
}

// NewCartHandler creates a new CartHandler
func NewCartHandler(cartUseCase *usecase.CartUseCase) *CartHandler {
	return &CartHandler{
		cartUseCase: cartUseCase,
	}
}

// GetCart handles getting a user's cart
// @Summary Get user's cart
// @Description Get the shopping cart for the authenticated user
// @Tags cart
// @Produce json
// @Success 200 {object} entity.Cart
// @Failure 404 {object} map[string]string
// @Router /api/v1/cart [get]
func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	cart, err := h.cartUseCase.GetCart(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(cart)
}

// AddItem handles adding an item to the cart
// @Summary Add item to cart
// @Description Add an item to the user's shopping cart
// @Tags cart
// @Accept json
// @Produce json
// @Param request body usecase.AddItemRequest true "Add item request"
// @Success 200 {object} entity.Cart
// @Failure 400 {object} map[string]string
// @Router /api/v1/cart/items [post]
func (h *CartHandler) AddItem(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req usecase.AddItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.ProductID == "" || req.Quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Product ID and valid quantity are required",
		})
	}

	cart, err := h.cartUseCase.AddItem(c.Context(), userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(cart)
}

// RemoveItem handles removing an item from the cart
// @Summary Remove item from cart
// @Description Remove an item from the user's shopping cart
// @Tags cart
// @Param id path string true "Product ID"
// @Success 200 {object} entity.Cart
// @Failure 404 {object} map[string]string
// @Router /api/v1/cart/items/{id} [delete]
func (h *CartHandler) RemoveItem(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	productID := c.Params("id")

	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Product ID is required",
		})
	}

	cart, err := h.cartUseCase.RemoveItem(c.Context(), userID, productID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(cart)
}

// UpdateItemQuantity handles updating the quantity of an item in the cart
// @Summary Update item quantity in cart
// @Description Update the quantity of an item in the user's shopping cart
// @Tags cart
// @Param id path string true "Product ID"
// @Param quantity query int true "New quantity"
// @Success 200 {object} entity.Cart
// @Failure 400 {object} map[string]string
// @Router /api/v1/cart/items/{id} [put]
func (h *CartHandler) UpdateItemQuantity(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	productID := c.Params("id")

	if productID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Product ID is required",
		})
	}

	quantityStr := c.Query("quantity")
	if quantityStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Quantity is required",
		})
	}

	quantity, err := strconv.Atoi(quantityStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid quantity",
		})
	}

	if quantity <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Quantity must be greater than 0",
		})
	}

	cart, err := h.cartUseCase.UpdateItemQuantity(c.Context(), userID, productID, quantity)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(cart)
}

// ClearCart handles clearing all items from the cart
// @Summary Clear cart
// @Description Clear all items from the user's shopping cart
// @Tags cart
// @Success 200 {object} entity.Cart
// @Failure 404 {object} map[string]string
// @Router /api/v1/cart/clear [post]
func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	cart, err := h.cartUseCase.ClearCart(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(cart)
}
