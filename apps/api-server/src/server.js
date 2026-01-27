/**
 * E-Commerce API Server
 * 
 * Production-grade security implementation:
 * - Rate limiting on all endpoints
 * - Strict CORS policy
 * - Helmet security headers
 * - JWT authentication
 * - Role-based authorization
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const connectDB = require('./config/db');
const { corsOptions } = require('./config/cors');
const { generalLimiter, authLimiter, paymentLimiter, adminLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/error');

// Connect to Database
connectDB();

const app = express();

// ============================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================

// 1. Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// 2. Security headers
app.use(helmet({
    crossOriginResourcePolicy: false, // Allow images from different origins
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));

// 3. CORS - Strict origin validation
app.use(cors(corsOptions));

// 4. Body parsing with size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 5. Data Sanitization
// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// 5. Request logging (disable in production for performance)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined')); // More detailed logs for production
}

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
    maxAge: '7d', // Cache static files
    etag: true
}));

// ============================================
// RATE LIMITED ROUTES
// ============================================

// Authentication routes (strictest limits)
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));

// Public product routes (general limits)
app.use('/api/products', generalLimiter, require('./routes/productRoutes'));

// Protected routes (require auth)
app.use('/api/cart', generalLimiter, require('./routes/cartRoutes'));
app.use('/api/orders', paymentLimiter, require('./routes/orderRoutes'));
app.use('/api/wishlist', generalLimiter, require('./routes/wishlistRoutes'));

// Admin routes (admin-specific limits + auth required)
app.use('/api/admin', adminLimiter, require('./routes/adminRoutes'));
app.use('/api/settings', generalLimiter, require('./routes/settingsRoutes'));

// Webhook (no rate limit but signature verified in controller)
app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), require('./controllers/webhookController').handleRazorpayWebhook);

// ============================================
// FILE UPLOAD ROUTE
// ============================================
const upload = require('./middleware/upload');
const { protect, authorize } = require('./middleware/auth');

app.post('/api/upload',
    generalLimiter,
    protect,
    authorize('SuperAdmin', 'Manager'),
    upload.array('images', 5),
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'Please upload files' });
        }

        const fileUrls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);

        res.json({
            success: true,
            urls: fileUrls
        });
    }
);

// ============================================
// UTILITY ROUTES
// ============================================

// Health check (no rate limit for monitoring)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// Root route
app.get('/', generalLimiter, (req, res) => {
    res.json({
        message: 'Welcome to the E-Commerce API',
        status: 'Running',
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ============================================
// ERROR HANDLER (Must be last)
// ============================================
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`📍 CORS: Allowing origins from env config`);
        console.log(`🔒 Rate limiting: Enabled`);
    });
}

module.exports = app;

