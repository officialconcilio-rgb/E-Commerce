# 🚀 E-Commerce Backend API

Production-ready Express.js backend for the clothing brand e-commerce platform.

## 📁 Folder Structure

```
src/
├── config/             # Database & app configurations
├── controllers/        # Business logic for each resource
├── middleware/         # Auth, Error handling, Validation
├── models/             # Mongoose schemas (MongoDB)
├── routes/             # API endpoint definitions
├── utils/              # Helper functions
├── seed.js             # Database seeding script
└── server.js           # Main entry point
```

## 🛠️ Features

- **Authentication:** JWT-based auth with Bcrypt password hashing.
- **RBAC:** Role-based access control (User, Manager, SuperAdmin).
- **Product Management:** Categories, Products, and Variants (SKU-level).
- **Shopping Cart:** Persistent cart management.
- **Orders & Payments:** Razorpay integration with signature verification.
- **Security:** Helmet, CORS, and Rate Limiting implemented.
- **Error Handling:** Centralized error handling for all routes.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root of `apps/api-server` (or use the root monorepo `.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Seed Data (Optional)
Populate the database with sample products and an admin user:
```bash
node src/seed.js
```

### 4. Run Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

| Resource | Base Path |
|----------|-----------|
| Auth | `/api/auth` |
| Products | `/api/products` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Admin | `/api/admin` |

---

**Maintained by:** CTO - Antigravity AI
