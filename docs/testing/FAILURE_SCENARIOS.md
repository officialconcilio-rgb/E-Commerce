# Common Failure Scenarios & Handling

## 1. Database Connection Failures

### Symptoms
- Server crashes on startup
- `MongooseServerSelectionError`
- Timeout errors

### Causes
- MongoDB Atlas IP not whitelisted
- Incorrect connection string
- Network issues

### Handling
```javascript
// Already implemented in config/db.js
mongoose.connect(uri).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
```

### User Action
- Check `.env` for correct `MONGODB_URI`
- Whitelist IP in MongoDB Atlas Network Access
- Try "Standard" connection string if SRV fails

---

## 2. Payment Failures

### Symptoms
- Payment modal errors
- Order stuck in Pending
- No confirmation after payment

### Causes
- Invalid Razorpay credentials
- Signature verification failure
- Network timeout during verification

### Handling (Implemented)
```javascript
// POST /api/orders/failed
// Records payment failures with error description
// Updates order.paymentStatus = 'Failed'
// Adds entry to order.history
```

### Recovery
- User can retry payment from "My Orders"
- Admin can manually verify payment in Razorpay Dashboard

---

## 3. Cart Sync Issues

### Symptoms
- Cart shows empty after login
- Items disappear

### Causes
- JWT token expired
- Server-side cart not synced

### Handling
- Cart stored in both localStorage (guest) and server (logged in)
- On login, local cart should merge with server cart

---

## 4. Order Creation Failures

### Symptoms
- "Failed to create order" error
- Cart not clearing after payment

### Causes
- Missing address
- Product out of stock
- Invalid variant ID

### Handling (Implemented)
```javascript
// Validates cart before order creation
if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
}
```

---

## 5. Rate Limiting

### Symptoms
- `429 Too Many Requests` errors
- API calls blocked

### Causes
- Too many requests from same IP
- Potential DDoS or abuse

### Handling
```javascript
// Install and configure
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: { success: false, message: 'Too many requests' }
});

app.use('/api/', limiter);
```

---

## 6. File Upload Failures

### Symptoms
- Image upload fails
- "Please upload files" error

### Causes
- File too large
- Invalid file type
- Disk space issues

### Handling (Implemented in middleware/upload.js)
- File size limit: 5MB
- Allowed types: jpeg, jpg, png, gif, webp

---

## 7. JWT Token Issues

### Symptoms
- 401 Unauthorized errors
- "Invalid token" message

### Causes
- Token expired
- Token tampered
- Missing Authorization header

### Handling
```javascript
// Frontend should:
// 1. Check token expiry before API calls
// 2. Redirect to login if expired
// 3. Clear localStorage on logout
```

---

## 8. Stock Depletion Race Condition

### Symptoms
- Order confirmed but stock went negative
- Two users bought last item

### Prevention (Recommended)
```javascript
// Use atomic update with condition
await Variant.findOneAndUpdate(
    { _id: variantId, stockQuantity: { $gte: quantity } },
    { $inc: { stockQuantity: -quantity } }
);
```

---

## Emergency Contacts

For production issues:
- **Database**: MongoDB Atlas Support
- **Payments**: Razorpay Support (support@razorpay.com)
- **Hosting**: Your hosting provider's support
