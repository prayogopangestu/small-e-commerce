# 🛒 MERN Stack E-commerce Application

![MERN](https://img.shields.io/badge/MERN-Stack-61DAFB?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A full-featured e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) following clean architecture principles. This project includes customer-facing features, admin dashboard, payment processing, and comprehensive order management.

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog** - Browse, search, and filter products with advanced filtering
- 🛒 **Shopping Cart** - Add, update, and remove items (supports guest & user carts)
- 🔐 **User Authentication** - Email/password + Social login (Google, Facebook OAuth)
- 💳 **Secure Checkout** - Payment processing with Stripe integration
- 📦 **Order Management** - View order history and track orders in real-time
- ⭐ **Reviews & Ratings** - Rate and review purchased products
- ❤️ **Wishlist** - Save favorite products for later
- 🎫 **Coupon System** - Apply discount coupons at checkout

### Admin Features
- 📊 **Dashboard** - Analytics and sales overview with charts
- 📦 **Product Management** - Create, update, and delete products with image uploads
- 📋 **Order Management** - View and manage all orders with status updates
- 👥 **Customer Management** - View and manage customer accounts
- 📈 **Inventory Management** - Track stock levels and inventory logs
- 🎟️ **Coupon Management** - Create and manage discount coupons
- 🔍 **Analytics** - Sales, product, and customer analytics with reports

## 🛠️ Tech Stack

### Frontend
- **React.js** 18.2.0 - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Lucide React** - Icons

### Backend
- **Node.js** 18+ - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **MongoDB** 7.0 - Database
- **Mongoose** 8.0.3 - ODM
- **JWT** - Authentication
- **Passport.js** - OAuth authentication
- **Stripe** 14.10.0 - Payment processing
- **Cloudinary** - Image storage
- **Redis** - Caching
- **Multer** - File upload handling
- **Joi** - Data validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📁 Project Structure

```
mern-ecommerce/
├── client/                      # React.js Frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   └── layout/         # Layout components (Header, Footer)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/          # Admin pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ProductsAdmin.jsx
│   │   │       ├── OrdersAdmin.jsx
│   │   │       ├── CustomersAdmin.jsx
│   │   │       ├── AnalyticsAdmin.jsx
│   │   │       └── InventoryAdmin.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   └── services/           # API service layers
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── server/                      # Node.js + Express.js Backend
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   ├── cloudinary.js
│   │   │   └── stripe.js
│   │   ├── controllers/        # Request controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   └── utils/              # Utility functions
│   ├── Dockerfile
│   └── package.json
│
├── plans/                       # Architecture documentation
│   └── ecommerce-architecture-plan.md
│
├── docker-compose.yml           # Docker Compose configuration
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (optional, for containerized setup)

### Installation

#### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mern-ecommerce.git
   cd mern-ecommerce
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Update environment variables** in `.env` file with your credentials

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - MongoDB: mongodb://localhost:27017

#### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mern-ecommerce.git
   cd mern-ecommerce
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   **Server (.env)**
   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/mern-ecommerce

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=15m
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   JWT_REFRESH_EXPIRE=7d

   # OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Redis (optional)
   REDIS_URL=redis://localhost:6379
   ```

   **Client (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

5. **Run the application**

   **Server** (in a new terminal)
   ```bash
   cd server
   npm run dev
   ```

   **Client** (in another terminal)
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173 (Vite default)
   - Backend API: http://localhost:5000/api

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/google/callback` | Google OAuth callback | No |
| GET | `/api/auth/facebook` | Initiate Facebook OAuth | No |
| GET | `/api/auth/facebook/callback` | Facebook OAuth callback | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/me` | Update profile | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List products | No |
| GET | `/api/products/featured` | Get featured products | No |
| GET | `/api/products/search` | Search products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| GET | `/api/products/slug/:slug` | Get product by slug | No |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| PATCH | `/api/products/:id/stock` | Update stock | Admin |

### Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | List categories | No |
| GET | `/api/categories/:id` | Get category by ID | No |
| GET | `/api/categories/:slug/products` | Get products by category | No |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user cart | Yes |
| POST | `/api/cart/items` | Add item to cart | Yes |
| PUT | `/api/cart/items/:itemId` | Update cart item | Yes |
| DELETE | `/api/cart/items/:itemId` | Remove item from cart | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |
| POST | `/api/cart/merge` | Merge guest cart to user cart | Yes |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wishlist` | Get user wishlist | Yes |
| POST | `/api/wishlist/items` | Add item to wishlist | Yes |
| DELETE | `/api/wishlist/items/:productId` | Remove item from wishlist | Yes |
| DELETE | `/api/wishlist` | Clear wishlist | Yes |
| POST | `/api/wishlist/move-to-cart` | Move items to cart | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | List user orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| POST | `/api/orders` | Create order | Yes |
| POST | `/api/orders/:id/cancel` | Cancel order | Yes |
| GET | `/api/orders/:id/track` | Track order | Yes |
| GET | `/api/orders/admin/all` | List all orders | Admin |
| PUT | `/api/orders/admin/:id/status` | Update order status | Admin |
| PUT | `/api/orders/admin/:id/tracking` | Update tracking info | Admin |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-intent` | Create payment intent | Yes |
| POST | `/api/payments/confirm` | Confirm payment | Yes |
| POST | `/api/payments/webhook` | Stripe webhook | No |
| GET | `/api/payments/:orderId` | Get payment details | Yes |

### Review Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews/products/:productId` | Get product reviews | No |
| POST | `/api/reviews/products/:productId` | Create review | Yes |
| PUT | `/api/reviews/:id` | Update review | Yes |
| DELETE | `/api/reviews/:id` | Delete review | Yes |
| POST | `/api/reviews/:id/helpful` | Mark review as helpful | Yes |
| GET | `/api/reviews/admin/all` | List all reviews | Admin |
| PUT | `/api/reviews/admin/:id/approve` | Approve review | Admin |

### Coupon Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/coupons/validate` | Validate coupon | Yes |
| GET | `/api/coupons/admin/all` | List all coupons | Admin |
| POST | `/api/coupons/admin` | Create coupon | Admin |
| PUT | `/api/coupons/admin/:id` | Update coupon | Admin |
| DELETE | `/api/coupons/admin/:id` | Delete coupon | Admin |

### Inventory Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/inventory` | Get inventory status | Admin |
| GET | `/api/inventory/logs` | Get inventory logs | Admin |
| POST | `/api/inventory/adjust` | Adjust stock | Admin |
| POST | `/api/inventory/bulk-update` | Bulk update stock | Admin |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard` | Dashboard analytics | Admin |
| GET | `/api/analytics/sales` | Sales analytics | Admin |
| GET | `/api/analytics/products` | Product analytics | Admin |
| GET | `/api/analytics/customers` | Customer analytics | Admin |
| GET | `/api/analytics/reports` | Generate reports | Admin |

## 👤 User Roles

- **customer** - Regular users with shopping capabilities
- **admin** - Full access to admin features and management
- **super_admin** - Full access plus user management capabilities

## 🔐 Default Admin Account

After running the application, create an admin account via the registration form and manually update the user role in the database:

```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 🗄️ Database Schema

The application uses MongoDB with the following collections:

| Collection | Description |
|------------|-------------|
| `User` | User accounts with social accounts |
| `Product` | Products with variants and attributes |
| `Category` | Hierarchical categories |
| `Order` | Order management with status tracking |
| `Cart` | Shopping cart for guests and users |
| `Wishlist` | User wishlists |
| `Review` | Product reviews with ratings |
| `Coupon` | Discount coupons |
| `InventoryLog` | Stock tracking |
| `Analytics` | Sales and customer analytics |

## 🌐 Deployment

### Frontend Deployment

**Vercel**
```bash
npm run build
vercel --prod
```

**Netlify**
```bash
npm run build
netlify deploy --prod
```

### Backend Deployment

**Heroku**
```bash
heroku create your-app-name
git push heroku main
```

**AWS EC2 / DigitalOcean**
```bash
# Use PM2 for process management
npm install -g pm2
pm2 start src/app.js --name mern-ecommerce
pm2 startup
pm2 save
```

### Database

- **MongoDB Atlas** - Recommended for production
- Configure connection string in environment variables

### Environment Variables for Production

Make sure to set all required environment variables in your production environment. Never commit `.env` files to version control.

## 🧪 Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email support@example.com or open an issue in the repository.

## 🙏 Acknowledgments

- Built with the MERN stack
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Payment processing by [Stripe](https://stripe.com/)
- Image hosting by [Cloudinary](https://cloudinary.com/)

## 📸 Screenshots

<!-- Add screenshots of your application here -->

### Customer View
- Product Catalog
- Shopping Cart
- Checkout Process
- Order History

### Admin Dashboard
- Overview Dashboard
- Product Management
- Order Management
- Analytics

---

**Made with ❤️ using MERN Stack**
