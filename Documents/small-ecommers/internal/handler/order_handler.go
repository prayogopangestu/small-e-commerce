package handler

import (
	"small-ecommers/internal/domain/entity"
	"small-ecommers/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

// OrderHandler handles HTTP requests for order operations
type OrderHandler struct {
	orderUseCase *usecase.OrderUseCase
}

// NewOrderHandler creates a new OrderHandler
func NewOrderHandler(orderUseCase *usecase.OrderUseCase) *OrderHandler {
	return &OrderHandler{
		orderUseCase: orderUseCase,
	}
}

// CreateOrder handles creating a new order from cart
// @Summary Create order from cart
// @Description Create a new order from the user's shopping cart
// @Tags orders
// @Produce json
// @Success 201 {object} entity.Order
// @Failure 400 {object} map[string]string
// @Router /api/v1/orders [post]
func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	order, err := h.orderUseCase.CreateOrder(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(order)
}

// GetOrder handles getting an order by ID
// @Summary Get order by ID
// @Description Get an order by its ID
// @Tags orders
// @Produce json
// @Param id path string true "Order ID"
// @Success 200 {object} entity.Order
// @Failure 404 {object} map[string]string
// @Router /api/v1/orders/{id} [get]
func (h *OrderHandler) GetOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Order ID is required",
		})
	}

	order, err := h.orderUseCase.GetOrder(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(order)
}

// GetUserOrders handles getting all orders for a user
// @Summary Get user's orders
// @Description Get all orders for the authenticated user
// @Tags orders
// @Produce json
// @Success 200 {array} entity.Order
// @Router /api/v1/orders [get]
func (h *OrderHandler) GetUserOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	orders, err := h.orderUseCase.GetUserOrders(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(orders)
}

// PayOrder handles paying an order
// @Summary Pay order
// @Description Mark an order as paid
// @Tags orders
// @Param id path string true "Order ID"
// @Success 200 {object} entity.Order
// @Failure 400 {object} map[string]string
// @Router /api/v1/orders/{id}/pay [post]
func (h *OrderHandler) PayOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Order ID is required",
		})
	}

	order, err := h.orderUseCase.PayOrder(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(order)
}

// CancelOrder handles cancelling an order
// @Summary Cancel order
// @Description Cancel an order
// @Tags orders
// @Param id path string true "Order ID"
// @Success 200 {object} entity.Order
// @Failure 400 {object} map[string]string
// @Router /api/v1/orders/{id}/cancel [post]
func (h *OrderHandler) CancelOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Order ID is required",
		})
	}

	order, err := h.orderUseCase.CancelOrder(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(order)
}

// UpdateOrderStatus handles updating the status of an order
// @Summary Update order status
// @Description Update the status of an order (admin only)
// @Tags orders
// @Param id path string true "Order ID"
// @Param status query string true "New status"
// @Success 200 {object} entity.Order
// @Failure 400 {object} map[string]string
// @Router /api/v1/orders/{id}/status [put]
func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Order ID is required",
		})
	}

	statusStr := c.Query("status")
	if statusStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Status is required",
		})
	}

	status := entity.OrderStatus(statusStr)

	// Validate status
	switch status {
	case entity.OrderStatusPending, entity.OrderStatusPaid, entity.OrderStatusShipped,
		entity.OrderStatusCompleted, entity.OrderStatusCancelled:
		// Valid status
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid status",
		})
	}

	order, err := h.orderUseCase.UpdateOrderStatus(c.Context(), id, status)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(order)
}
