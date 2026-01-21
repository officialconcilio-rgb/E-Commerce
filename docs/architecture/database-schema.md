# FINAL Database Schema Design

**Project:** Professional E-Commerce Platform  
**Status:** FINAL SCHEMA  
**Last Updated:** January 15, 2026

---

## 1. Collections & Schema Definitions

### **A. Users**
Stores customer profiles and authentication data.
```typescript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, index: true },
  password: { type: String, select: false }, // Hashed
  phone: { type: String, sparse: true },
  addresses: [{
    type: { type: String, enum: ['Home', 'Work', 'Other'] },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    isDefault: Boolean
  }],
  wishlist: [{ type: ObjectId, ref: 'Products' }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **B. Admins**
Separate collection for internal staff to maintain security boundaries.
```typescript
{
  _id: ObjectId,
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['SuperAdmin', 'Manager', 'Editor'], default: 'Editor' },
  permissions: [String],
  lastLogin: Date,
  createdAt: Date
}
```

### **C. Categories**
Hierarchical category structure for the clothing brand.
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  description: String,
  parentCategory: { type: ObjectId, ref: 'Categories', default: null },
  image: String,
  isActive: { type: Boolean, default: true },
  metadata: Object // For SEO (Title, Meta Description)
}
```

### **D. Products**
Core product data. Variants are referenced for inventory precision.
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true, index: 'text' },
  slug: { type: String, unique: true, index: true },
  description: { type: String, index: 'text' },
  basePrice: { type: Number, required: true },
  discountPrice: Number,
  category: { type: ObjectId, ref: 'Categories', index: true },
  images: [String], // URLs
  tags: [{ type: String, index: true }],
  attributes: [{
    name: String, // e.g., "Material"
    value: String // e.g., "Cotton"
  }],
  isFeatured: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  metadata: Object // AI-ready metadata/embeddings
}
```

### **E. Variants**
Specific SKU details (Size/Color combinations).
```typescript
{
  _id: ObjectId,
  productId: { type: ObjectId, ref: 'Products', index: true },
  sku: { type: String, unique: true, index: true },
  size: { type: String, required: true }, // S, M, L, XL
  color: { type: String, required: true },
  priceOverride: Number, // If specific variant costs more
  stockQuantity: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}
```

### **F. Cart**
Persistent shopping cart for users.
```typescript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'Users', unique: true, index: true },
  items: [{
    productId: { type: ObjectId, ref: 'Products' },
    variantId: { type: ObjectId, ref: 'Variants' },
    quantity: { type: Number, min: 1 },
    addedAt: { type: Date, default: Date.now }
  }],
  updatedAt: Date
}
```

### **G. Orders**
Immutable record of a transaction.
```typescript
{
  _id: ObjectId,
  orderNumber: { type: String, unique: true, index: true }, // e.g., ORD-2026-0001
  userId: { type: ObjectId, ref: 'Users', index: true },
  items: [{
    productId: { type: ObjectId, ref: 'Products' },
    variantId: { type: ObjectId, ref: 'Variants' },
    name: String, // Snapshot for immutability
    sku: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  discountAmount: Number,
  shippingFee: Number,
  finalAmount: Number,
  shippingAddress: Object, // Snapshot of address
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending',
    index: true
  },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  trackingId: String,
  courierPartner: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **H. Payments**
Detailed payment transaction logs.
```typescript
{
  _id: ObjectId,
  orderId: { type: ObjectId, ref: 'Orders', index: true },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  method: String, // UPI, Card, Netbanking, COD
  status: String,
  rawResponse: Object // Full response from Razorpay for debugging
}
```

### **I. Coupons**
Marketing and discount management.
```typescript
{
  _id: ObjectId,
  code: { type: String, unique: true, index: true },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: Number,
  maxDiscount: Number,
  expiryDate: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}
```

### **J. Reviews**
Customer feedback and ratings.
```typescript
{
  _id: ObjectId,
  productId: { type: ObjectId, ref: 'Products', index: true },
  userId: { type: ObjectId, ref: 'Users', index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: Date
}
```

---

## 2. Relationships: Embed vs Reference

| Relationship | Type | Reasoning |
|--------------|------|-----------|
| **User -> Addresses** | **Embed** | Addresses are small and tightly coupled to the user. Fetching them together improves performance. |
| **Product -> Category** | **Reference** | Categories are shared across many products. Referencing allows easy updates to category metadata. |
| **Product -> Variants** | **Reference** | For clothing, inventory (stock) changes frequently. Separate documents prevent "document growth" issues and allow atomic stock updates. |
| **Order -> Items** | **Embed (Snapshot)** | Items in an order must be immutable. We store a snapshot of name/price at the time of purchase to prevent historical data changes. |
| **User -> Cart** | **Reference** | Carts change frequently. Keeping them separate prevents the User document from becoming bloated with transient data. |

---

## 3. Indexing Strategy

1. **Compound Indexes:**
   - `Products`: `{ category: 1, isActive: 1 }` for fast category browsing.
   - `Variants`: `{ productId: 1, isActive: 1 }` for fetching available sizes/colors.
   - `Orders`: `{ userId: 1, createdAt: -1 }` for user order history.

2. **Text Indexes:**
   - `Products`: `{ name: 'text', description: 'text', tags: 'text' }` for basic search functionality.

3. **TTL Indexes:**
   - `Cart`: Expire after 30 days of inactivity to keep the DB clean.

4. **Unique Indexes:**
   - `Users.email`, `Admins.username`, `Products.slug`, `Variants.sku`, `Coupons.code`.

---

## 4. Reasoning & Design Decisions

1. **Immutability in Orders:** We snapshot product details (name, price, address) inside the Order document. If a product price changes tomorrow, the historical order record remains accurate.
2. **Atomic Inventory:** By using a separate `Variants` collection, we can use MongoDB's `$inc` operator for atomic stock decrements, preventing overselling during high-traffic sales.
3. **Security via Separation:** Admins are in a separate collection to prevent accidental privilege escalation and to allow different schema requirements (e.g., permissions arrays).
4. **AI-Readiness:** The `metadata` field in Products is reserved for vector embeddings or structured data that AI recommendation engines can consume.
5. **Scalability:** The schema avoids deep nesting (except for snapshots), ensuring that document sizes stay well within the 16MB limit even for power users.

---

**CTO Signature:** Antigravity AI  
**Date:** January 15, 2026
