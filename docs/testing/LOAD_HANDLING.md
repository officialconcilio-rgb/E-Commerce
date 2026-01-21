# Load Handling Basics

## Current Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Storefront │     │ Admin Panel │     │   Mobile    │
│  (Next.js)  │     │  (Next.js)  │     │    App      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  API Server │
                    │  (Express)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  MongoDB    │
                    │  (Atlas)    │
                    └─────────────┘
```

---

## Basic Optimizations (Already Implemented)

### 1. Database Indexes
```javascript
// In models - indexed fields for faster queries
email: { type: String, unique: true, index: true }
orderNumber: { type: String, unique: true, index: true }
status: { index: true }
```

### 2. Response Compression
Add to server.js:
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Static File Caching
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
    maxAge: '7d' // Cache for 7 days
}));
```

---

## Rate Limiting (Recommended)

Add to server.js:
```javascript
const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 attempts per 15 minutes
    message: { success: false, message: 'Too many login attempts' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

---

## Caching Strategy

### Option 1: In-Memory Cache (Simple)
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute default

// Cache categories (they change rarely)
exports.getCategories = async (req, res) => {
    const cached = cache.get('categories');
    if (cached) return res.json({ categories: cached });
    
    const categories = await Category.find({ isActive: true });
    cache.set('categories', categories);
    res.json({ categories });
};
```

### Option 2: Redis (Production)
For high-traffic production, use Redis for distributed caching.

---

## Database Connection Pooling

MongoDB driver automatically pools connections. For high load:
```javascript
mongoose.connect(uri, {
    maxPoolSize: 50, // Increase pool size
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
});
```

---

## Horizontal Scaling

### PM2 Cluster Mode
```bash
# Install PM2
npm install -g pm2

# Start with cluster mode (use all CPU cores)
pm2 start src/server.js -i max
```

### Load Balancer
For multiple servers, use:
- **AWS**: Application Load Balancer
- **Nginx**: Reverse proxy with upstream servers
- **Cloudflare**: DNS-based load balancing

---

## Monitoring

### Basic Health Check
```javascript
// Already implemented
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
```

### PM2 Monitoring
```bash
pm2 monit
```

### External Monitoring
- **UptimeRobot**: Free uptime monitoring
- **New Relic**: Application performance monitoring
- **Datadog**: Full observability

---

## Quick Wins Checklist

- [ ] Add `compression` middleware
- [ ] Enable rate limiting
- [ ] Add static file caching headers
- [ ] Increase MongoDB pool size
- [ ] Use PM2 cluster mode
- [ ] Set up health check monitoring
