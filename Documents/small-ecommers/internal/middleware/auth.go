package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// AuthRequired is a middleware that checks if the user is authenticated
// For simplicity, this is a basic implementation that expects a user_id header
// In production, you would use JWT tokens
func AuthRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get user_id from header (simplified for demo)
		userID := c.Get("X-User-ID")

		if userID == "" {
			// Try to get from Authorization header
			authHeader := c.Get("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				// In production, validate JWT token here
				// For demo, we'll extract user_id from token (simplified)
				token := strings.TrimPrefix(authHeader, "Bearer ")
				if token != "" {
					// This is a simplified check - in production, validate JWT
					userID = token
				}
			}
		}

		if userID == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized - X-User-ID header or Bearer token required",
			})
		}

		// Store user_id in context
		c.Locals("user_id", userID)

		return c.Next()
	}
}
