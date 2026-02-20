package usecase

import (
	"context"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"small-ecommers/internal/domain/entity"
	"small-ecommers/internal/domain/repository"
)

// UserUseCase defines the business logic for user operations
type UserUseCase struct {
	userRepo repository.UserRepository
}

// NewUserUseCase creates a new UserUseCase
func NewUserUseCase(userRepo repository.UserRepository) *UserUseCase {
	return &UserUseCase{
		userRepo: userRepo,
	}
}

// RegisterRequest represents the request to register a new user
type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest represents the request to login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Register registers a new user
func (uc *UserUseCase) Register(ctx context.Context, req *RegisterRequest) (*entity.User, error) {
	// Check if user already exists
	existingUser, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, entity.ErrUserAlreadyExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create new user
	user := entity.NewUser(
		uuid.New().String(),
		req.Name,
		req.Email,
		string(hashedPassword),
	)

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// Login authenticates a user
func (uc *UserUseCase) Login(ctx context.Context, req *LoginRequest) (*entity.User, error) {
	user, err := uc.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, entity.ErrUserNotFound
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, entity.ErrInvalidCredentials
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (uc *UserUseCase) GetUserByID(ctx context.Context, id string) (*entity.User, error) {
	return uc.userRepo.GetByID(ctx, id)
}

// ListUsers retrieves all users
func (uc *UserUseCase) ListUsers(ctx context.Context) ([]*entity.User, error) {
	return uc.userRepo.List(ctx)
}
