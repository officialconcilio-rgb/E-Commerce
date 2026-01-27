/**
 * Rate Limiting Middleware
 * 
 * Production-grade implementation with:
 * - IP-based limiting for public routes
 * - User-based limiting for authenticated routes
 * - Configurable via environment variables
 * - Proper HTTP 429 responses with headers
 */

const rateLimit = require('express-rate-limit');

// ============================================
// CONFIGURATION (from environment variables)
// ============================================
const isDevelopment = process.env.NODE_ENV !== 'production';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const RATE_LIMIT_AUTH_MAX = parseInt(process.env.RATE_LIMIT_AUTH_MAX) || (isDevelopment ? 1000 : 100); // Higher limit in dev
const RATE_LIMIT_PAYMENT_MAX = parseInt(process.env.RATE_LIMIT_PAYMENT_MAX) || 20; // Payment endpoints

// ============================================
// GENERAL API RATE LIMITER
// ============================================
const generalLimiter = rateLimit({
    windowMs: isDevelopment ? 1 * 60 * 1000 : RATE_LIMIT_WINDOW_MS, // 1 minute in dev
    max: isDevelopment ? 1000 : RATE_LIMIT_MAX_REQUESTS, // 1000 requests per minute in dev
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    },
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise use IP
        if (req.user) {
            return `user_${req.user._id}`;
        }
        if (req.admin) {
            return `admin_${req.admin._id}`;
        }
        return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    },
    handler: (req, res, next, options) => {
        res.status(429).json(options.message);
    }
});

// ============================================
// AUTHENTICATION RATE LIMITER (Stricter)
// Prevents brute-force attacks on login/register
// ============================================
const authLimiter = rateLimit({
    windowMs: isDevelopment ? 1 * 60 * 1000 : RATE_LIMIT_WINDOW_MS, // 1 minute in dev, 15 in prod
    max: isDevelopment ? 500 : RATE_LIMIT_AUTH_MAX, // Very high limit in dev
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    skipFailedRequests: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please wait before trying again.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    },
    keyGenerator: (req) => {
        // Always use IP for auth endpoints (user not authenticated yet)
        return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    },
    handler: (req, res, next, options) => {
        console.warn(`[SECURITY] Rate limit exceeded for auth from IP: ${req.ip}`);
        res.status(429).json(options.message);
    }
});

// ============================================
// PAYMENT RATE LIMITER
// Moderate limits for payment endpoints
// ============================================
const paymentLimiter = rateLimit({
    windowMs: isDevelopment ? 1 * 60 * 1000 : RATE_LIMIT_WINDOW_MS,
    max: isDevelopment ? 500 : RATE_LIMIT_PAYMENT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many payment requests. Please wait before trying again.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    },
    keyGenerator: (req) => {
        if (req.user) {
            return `payment_user_${req.user._id}`;
        }
        return `payment_ip_${req.ip}`;
    },
    handler: (req, res, next, options) => {
        console.warn(`[SECURITY] Payment rate limit exceeded for: ${req.user?._id || req.ip}`);
        res.status(429).json(options.message);
    }
});

// ============================================
// ADMIN RATE LIMITER
// Protect admin endpoints from abuse
// ============================================
const adminLimiter = rateLimit({
    windowMs: isDevelopment ? 1 * 60 * 1000 : RATE_LIMIT_WINDOW_MS,
    max: isDevelopment ? 500 : 50, // 500 in dev, 50 in prod
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many admin requests. Please slow down.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    },
    keyGenerator: (req) => {
        if (req.admin) {
            return `admin_ops_${req.admin._id}`;
        }
        return `admin_ip_${req.ip}`;
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    paymentLimiter,
    adminLimiter
};
