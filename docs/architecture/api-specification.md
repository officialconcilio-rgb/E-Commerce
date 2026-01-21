# FINAL REST API Specification

**Project:** Professional E-Commerce Platform  
**Status:** FINAL CONTRACT  
**Last Updated:** January 15, 2026

---

## 1. Authentication APIs (`/api/auth`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/register` | POST | No | - | Register a new customer |
| `/login` | POST | No | - | Login and receive JWT in HTTP-only cookie |
| `/logout` | POST | Yes | User/Admin | Clear auth cookies |
| `/me` | GET | Yes | User/Admin | Get current user profile |
| `/refresh` | POST | No | - | Refresh access token using refresh token |

**Request Body (Login):**
```json
{ "email": "user@example.com", "password": "password123" }
```
**Success Response (200 OK):**
```json
{ "success": true, "user": { "id": "...", "email": "...", "firstName": "..." } }
```

---

## 2. Product APIs (`/api/products`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/` | GET | No | - | List products (with filters, search, pagination) |
| `/:slug` | GET | No | - | Get single product details by slug |
| `/categories` | GET | No | - | List all categories |
| `/:id/reviews` | GET | No | - | Get reviews for a product |
| `/:id/reviews` | POST | Yes | User | Post a review (verified purchase check) |

**Query Params (List):** `?page=1&limit=20&category=men&sort=price_asc&search=shirt`

---

## 3. Cart APIs (`/api/cart`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/` | GET | Yes | User | Get current user's cart |
| `/add` | POST | Yes | User | Add item to cart |
| `/update` | PATCH | Yes | User | Update item quantity |
| `/remove/:variantId` | DELETE | Yes | User | Remove item from cart |
| `/clear` | DELETE | Yes | User | Clear entire cart |

**Request Body (Add):**
```json
{ "productId": "...", "variantId": "...", "quantity": 1 }
```

---

## 4. Wishlist APIs (`/api/wishlist`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/` | GET | Yes | User | Get user's wishlist |
| `/toggle/:productId` | POST | Yes | User | Add/Remove product from wishlist |

---

## 5. Order APIs (`/api/orders`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/` | POST | Yes | User | Create a new order (returns Razorpay Order ID) |
| `/` | GET | Yes | User | List user's order history |
| `/:id` | GET | Yes | User | Get specific order details |
| `/:id/cancel` | PATCH | Yes | User | Cancel a pending order |

**Request Body (Create):**
```json
{ 
  "addressId": "...", 
  "couponCode": "SUMMER20", 
  "paymentMethod": "UPI" 
}
```

---

## 6. Payment APIs (`/api/payments`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/verify` | POST | Yes | User | Verify Razorpay payment signature |
| `/webhook` | POST | No | - | Razorpay webhook for async status updates |

**Request Body (Verify):**
```json
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

---

## 7. Coupon APIs (`/api/coupons`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/validate/:code` | GET | Yes | User | Check if a coupon is valid for current cart |

---

## 8. Admin APIs (`/api/admin`)

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/products` | POST | Yes | Admin | Create new product |
| `/products/:id` | PUT | Yes | Admin | Update product |
| `/variants` | POST | Yes | Admin | Add/Update inventory variants |
| `/orders` | GET | Yes | Admin | List all orders (with filters) |
| `/orders/:id/status` | PATCH | Yes | Admin | Update order/shipping status |
| `/analytics` | GET | Yes | Admin | Get dashboard stats (sales, users, etc.) |
| `/coupons` | POST | Yes | Admin | Create new coupon |

---

## 9. Error Handling

**Error Response Format (JSON):**
```json
{
  "success": false,
  "message": "Error description here",
  "errors": [] // Optional validation details
}
```

**Common Error Cases:**
- `400 Bad Request`: Validation failed (e.g., missing fields).
- `401 Unauthorized`: Token missing or expired.
- `403 Forbidden`: Insufficient permissions (e.g., User trying to access Admin API).
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Resource already exists (e.g., Email already registered).
- `422 Unprocessable Entity`: Business logic failure (e.g., Out of stock).
- `500 Internal Server Error`: Unexpected server failure.

---

**CTO Signature:** Antigravity AI  
**Date:** January 15, 2026
