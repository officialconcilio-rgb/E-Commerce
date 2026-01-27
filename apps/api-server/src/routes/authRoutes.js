const express = require('express');
const router = express.Router();
const {
    // Email OTP Login
    sendEmailLoginOTP,
    verifyEmailLoginOTP,
    // Legacy/Core
    login,
    getMe,
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateProfile,
    googleSimulated
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Simulated Google Login
router.post('/google-simulated', googleSimulated);

// Email OTP Login/Signup
router.post('/login/email', sendEmailLoginOTP);
router.post('/login/verify', verifyEmailLoginOTP);

// Reset password (initiate)
// router.post('/forgot-password', forgotPassword); // To be implemented if needed

// Login (Legacy/Admin)
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/addresses', protect, getAddresses);
router.post('/address', protect, addAddress);
router.put('/address/:addressId', protect, updateAddress);
router.delete('/address/:addressId', protect, deleteAddress);
router.put('/address/:addressId/default', protect, setDefaultAddress);

module.exports = router;
