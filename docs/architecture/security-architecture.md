# Security Architecture & Boundaries

**Project:** Professional E-Commerce Platform  
**Status:** FINAL ARCHITECTURE  
**Last Updated:** January 15, 2026

---

## 1. Authentication & Authorization

### **User Authentication**
- **Mechanism:** JWT (JSON Web Tokens) stored in HTTP-only, Secure cookies.
- **Password Security:** Hashed using `bcrypt` with a salt factor of 12.
- **Session Management:** Short-lived Access Tokens + Long-lived Refresh Tokens.
- **Multi-Factor:** Future-ready for OTP-based login (Email/SMS).

### **Authorization Levels (RBAC)**
1. **Guest:** Can browse products, view cart.
2. **Customer:** Can manage profile, view orders, checkout, post reviews.
3. **Admin:** Full access to inventory, orders, users, and analytics.
4. **Super Admin:** System configuration and admin management.

---

## 2. Security Boundaries

### **A. API Security**
- **CORS:** Restricted to specific frontend domains.
- **Rate Limiting:** Implemented via `express-rate-limit` to prevent Brute Force and DoS.
- **Input Validation:** Strict schema validation (Zod) for all incoming requests.
- **Sanitization:** Protection against NoSQL Injection and XSS using `helmet` and `mongo-sanitize`.

### **B. Admin Boundary**
- **Route Protection:** All `/api/admin/*` routes require a valid JWT with `role: 'admin'`.
- **IP Whitelisting:** (Optional) Restrict admin dashboard access to specific IP ranges.
- **Audit Logs:** Every administrative action (price change, order status update) is logged in an `AuditLog` collection.

### **C. Payment Security**
- **PCI Compliance:** No credit card data ever touches our servers. All sensitive data is handled by Razorpay.
- **Signature Verification:** Every payment is verified server-side using the Razorpay Secret Key before updating order status.
- **Webhook Security:** Webhook endpoints verify the `x-razorpay-signature` header.

### **D. Data Security**
- **Encryption at Rest:** Handled by MongoDB Atlas (AES-256).
- **Encryption in Transit:** Enforced TLS 1.2+ for all connections (HTTPS).
- **Environment Variables:** Sensitive keys (JWT Secret, Razorpay Secret) managed via `.env` and never committed to version control.

---

## 3. Threat Model & Mitigation

| Threat | Mitigation Strategy |
|--------|---------------------|
| **XSS** | Content Security Policy (CSP) + React's auto-escaping |
| **CSRF** | SameSite Cookie attribute + Custom Header validation |
| **NoSQL Injection** | Mongoose Schema + Query Sanitization |
| **Brute Force** | Account lockout after 5 failed attempts + Rate limiting |
| **Data Leak** | Minimal data return in APIs (exclude passwords/internal IDs) |

---

**CTO Signature:** Antigravity AI  
**Date:** January 15, 2026
