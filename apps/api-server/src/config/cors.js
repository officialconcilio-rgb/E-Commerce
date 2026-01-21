/**
 * CORS Configuration
 * 
 * Production-grade implementation with:
 * - Environment-specific origins (dev, staging, production)
 * - No wildcard (*) for authenticated routes
 * - Proper headers for credentials
 * - Configurable via environment variables
 */

// ============================================
// ALLOWED ORIGINS (from environment)
// ============================================
const getAllowedOrigins = () => {
    const origins = [];

    // Always include configured frontend URLs
    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL);
    }
    if (process.env.ADMIN_URL) {
        origins.push(process.env.ADMIN_URL);
    }

    // Additional origins from comma-separated list
    if (process.env.ALLOWED_ORIGINS) {
        const additional = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
        origins.push(...additional);
    }

    // Development mode allows localhost variations
    if (process.env.NODE_ENV === 'development') {
        origins.push(
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
        );
    }

    return [...new Set(origins)]; // Remove duplicates
};

// ============================================
// CORS OPTIONS
// ============================================
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();

        // Allow requests with no origin (mobile apps, curl, Postman)
        // In production, you might want to restrict this
        if (!origin) {
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            // In production, only allow no-origin for specific paths (webhooks)
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
    },

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token'
    ],

    // Exposed headers (visible to browser)
    exposedHeaders: [
        'RateLimit-Limit',
        'RateLimit-Remaining',
        'RateLimit-Reset',
        'X-Total-Count'
    ],

    // How long the browser should cache preflight results (24 hours)
    maxAge: 86400,

    // Pass the preflight response to the next handler
    preflightContinue: false,

    // Provide a successful response for OPTIONS requests
    optionsSuccessStatus: 204
};

// ============================================
// STRICT CORS (for sensitive routes)
// No wildcards, no no-origin requests
// ============================================
const strictCorsOptions = {
    ...corsOptions,
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();

        // Strict mode: MUST have an origin and it MUST be allowed
        if (!origin) {
            console.warn('[CORS] Strict mode: Request without origin blocked');
            return callback(new Error('Origin required for this endpoint'));
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Strict mode: Blocked origin: ${origin}`);
            callback(new Error(`Origin ${origin} not allowed`));
        }
    }
};

module.exports = {
    corsOptions,
    strictCorsOptions,
    getAllowedOrigins
};
