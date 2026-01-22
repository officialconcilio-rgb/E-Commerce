# LIVE SYSTEM AUDIT REPORT
**Date:** 2026-01-22
**Auditor:** Principal Engineer / QA Lead
**System Status:** NOT READY FOR DEPLOYMENT

## 🚨 CRITICAL ISSUES (Must Fix Before Go-Live)

### 1. Stock Race Condition & Negative Inventory
- **Severity:** CRITICAL
- **Component:** Backend (Order/Payment)
- **Observed Behavior:**
  - `createOrder` does not check if items are in stock.
  - `verifyPayment` decrements stock using `$inc: -quantity` without checking if resulting stock is >= 0.
- **Reproduction:**
  1. Set product stock to 1.
  2. User A adds to cart and proceeds to checkout (Order Created).
  3. User B adds to cart and proceeds to checkout (Order Created).
  4. User A pays -> Stock becomes 0.
  5. User B pays -> Stock becomes -1.
- **Root Cause:** Missing stock validation in `createOrder` and atomic conditional update in `verifyPayment`.
- **Files:** `apps/api-server/src/controllers/orderController.js`

### 2. Stale Session State (Zombie Login)
- **Severity:** HIGH
- **Component:** Frontend (Auth)
- **Observed Behavior:**
  - User logs in, token is stored.
  - Token expires (or is revoked).
  - User refreshes homepage. `useAuthStore` rehydrates `isAuthenticated: true` from localStorage.
  - `checkAuth` is NOT called on homepage/shop.
  - User appears logged in but API calls (like Add to Cart) will fail silently or throw errors.
- **Reproduction:**
  1. Login.
  2. Manually expire token (or wait).
  3. Refresh page.
  4. UI shows "Profile" icon.
  5. Click "Add to Cart" -> Fails silently or console error.
- **Root Cause:** `checkAuth` is only called on protected routes (`checkout`, `profile`), not globally.
- **Files:** `apps/storefront/src/components/Navbar.tsx`, `apps/storefront/src/store/useAuthStore.ts`

## ⚠️ HIGH/MEDIUM ISSUES

### 3. Ghost Orders
- **Severity:** MEDIUM
- **Component:** Backend (Order)
- **Observed Behavior:**
  - Clicking "Pay" creates an Order in DB immediately.
  - If user cancels Razorpay modal or closes tab, Order remains "Pending" forever.
  - Admin panel becomes cluttered with abandoned orders.
- **Reproduction:**
  1. Go to Checkout.
  2. Click Pay.
  3. Close Razorpay popup.
  4. Check Admin Panel -> New "Pending" order exists.
- **Root Cause:** Order creation happens before Payment initiation.
- **Files:** `apps/storefront/src/app/checkout/page.tsx`, `apps/api-server/src/controllers/orderController.js`

### 4. Cart Sync Failure
- **Severity:** MEDIUM
- **Component:** Frontend (Cart)
- **Observed Behavior:**
  - If `fetchCart` fails (e.g., due to auth error), the error is caught and logged, but the UI state is not reset.
  - User might see a cached local cart or empty cart while thinking they are logged in.
- **Root Cause:** Silent failure in `useCartStore` actions.
- **Files:** `apps/storefront/src/store/useCartStore.ts`

## ✅ PASSED AUDIT POINTS
- **Payment Security:** Amount is calculated on backend. Signature is verified.
- **Duplicate Payments:** Prevented by `razorpayPaymentId` check.
- **Role Isolation:** Admin routes are protected by `authorize('Admin')` (verified in code).

---

## PHASE 2: ROOT-CAUSE CORRECTION PLAN

### Group 1: Auth & Session Fixes
**Goal:** Ensure UI always reflects true backend auth state.
1.  **Global Auth Check:**
    - Modify `Navbar.tsx` (or create `AuthProvider`) to call `checkAuth` on mount.
    - If `checkAuth` fails, trigger `logout` to clear state.
2.  **Token Handling:**
    - Ensure `api.ts` interceptor handles 401 responses by triggering logout globally.

### Group 2: Payment & Order Fixes (CRITICAL)
**Goal:** Prevent overselling and ensure data integrity.
1.  **Stock Validation:**
    - In `createOrder`, check stock availability for ALL items before creating order.
    - Throw error if insufficient stock.
2.  **Atomic Stock Update:**
    - In `verifyPayment`, use `findOneAndUpdate` with query `{ _id: variantId, stockQuantity: { $gte: quantity } }`.
    - If update fails (returned null), it means race condition hit -> Refund user and mark order Failed.
3.  **Ghost Order Cleanup (Optional but recommended):**
    - Implement a cron job or logic to expire Pending orders > 1 hour. (Skipping for now to focus on correctness).

### Group 3: Frontend State Fixes
1.  **Cart Error Handling:**
    - In `useCartStore`, if 401 is received, call `useAuthStore.getState().logout()`.

---

## EXECUTION ORDER
1.  **Auth Fixes** (Foundation)
2.  **Order/Stock Fixes** (Critical Logic)
3.  **Frontend Polish** (UX)
