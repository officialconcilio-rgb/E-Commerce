/**
 * Authentication & Authorization Middleware
 * 
 * Production-grade implementation with:
 * - JWT token validation
 * - User/Admin distinction
 * - Role-based access control
 * - Proper error responses (401/403)
 * - Token expiration handling
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// ============================================
// PROTECT MIDDLEWARE
// Validates JWT and attaches user to request
// ============================================
const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Validate token is not empty
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, invalid token format'
                });
            }

            // Verify and decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check token expiration (jwt.verify throws if expired, but double-check)
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired, please login again'
                });
            }

            // Try to find user first
            req.user = await User.findById(decoded.id).select('-password');

            // If not a user, try admin
            if (!req.user) {
                req.admin = await Admin.findById(decoded.id).select('-password');
            }

            // Neither user nor admin found
            if (!req.user && !req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, account not found'
                });
            }

            // Check if account is active
            if ((req.user && req.user.isActive === false) ||
                (req.admin && req.admin.isActive === false)) {
                return res.status(403).json({
                    success: false,
                    message: 'Account has been deactivated'
                });
            }

            next();
        } catch (error) {
            console.error('[AUTH] Token verification failed:', error.message);

            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired, please login again'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

// ============================================
// AUTHORIZE MIDDLEWARE
// Role-based access control
// ============================================
const authorize = (...roles) => {
    return (req, res, next) => {
        // Determine user role
        let userRole = 'User';

        if (req.admin) {
            userRole = req.admin.role;
        } else if (req.user && req.user.role) {
            userRole = req.user.role;
        }

        // Check if role is authorized
        if (!roles.includes(userRole)) {
            console.warn(`[AUTH] Unauthorized access attempt: Role ${userRole} tried to access route requiring ${roles.join(', ')}`);
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

// ============================================
// OPTIONAL AUTH MIDDLEWARE
// For routes that work with or without auth
// ============================================
const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];

            if (token && token !== 'null' && token !== 'undefined') {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');

                if (!req.user) {
                    req.admin = await Admin.findById(decoded.id).select('-password');
                }
            }
        } catch (error) {
            // Silently fail - user just won't be authenticated
            console.log('[AUTH] Optional auth failed:', error.message);
        }
    }
    next();
};

module.exports = { protect, authorize, optionalAuth };

