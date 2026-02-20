package handler

import (
	"small-ecommers/internal/usecase"

	"github.com/gofiber/fiber/v2"
)

// UserHandler handles HTTP requests for user operations
type UserHandler struct {
	userUseCase *usecase.UserUseCase
}

// NewUserHandler creates a new UserHandler
func NewUserHandler(userUseCase *usecase.UserUseCase) *UserHandler {
	return &UserHandler{
		userUseCase: userUseCase,
	}
}

// Register handles user registration
// @Summary Register a new user
// @Description Register a new user with name, email, and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body usecase.RegisterRequest true "Register request"
// @Success 201 {object} entity.User
// @Failure 400 {object} map[string]string
// @Router /api/v1/auth/register [post]
func (h *UserHandler) Register(c *fiber.Ctx) error {
	var req usecase.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name, email, and password are required",
		})
	}

	user, err := h.userUseCase.Register(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(user)
}

// Login handles user login
// @Summary Login a user
// @Description Login with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body usecase.LoginRequest true "Login request"
// @Success 200 {object} entity.User
// @Failure 401 {object} map[string]string
// @Router /api/v1/auth/login [post]
func (h *UserHandler) Login(c *fiber.Ctx) error {
	var req usecase.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	user, err := h.userUseCase.Login(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(user)
}

// GetUser handles getting a user by ID
// @Summary Get user by ID
// @Description Get a user by their ID
// @Tags users
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} entity.User
// @Failure 404 {object} map[string]string
// @Router /api/v1/users/{id} [get]
func (h *UserHandler) GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	user, err := h.userUseCase.GetUserByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(user)
}

// ListUsers handles listing all users
// @Summary List all users
// @Description Get a list of all users
// @Tags users
// @Produce json
// @Success 200 {array} entity.User
// @Router /api/v1/users [get]
func (h *UserHandler) ListUsers(c *fiber.Ctx) error {
	users, err := h.userUseCase.ListUsers(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(users)
}
