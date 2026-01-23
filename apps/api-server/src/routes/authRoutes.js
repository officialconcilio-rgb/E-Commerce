const express = require('express');
const router = express.Router();
const {
    // Multi-step registration
    initiateRegistration,
    verifyPhoneOTP,
    addEmailAndVerify,
    verifyEmail,
    setPassword,
    resendPhoneOTP,
    resendVerificationEmail,
    // Legacy
    register,
    login,
    getMe,
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Multi-step registration routes
router.post('/register/phone', initiateRegistration);
router.post('/register/verify-phone', verifyPhoneOTP);
router.post('/register/email', addEmailAndVerify);
router.get('/register/verify-email/:token', verifyEmail);
router.post('/register/set-password', setPassword);
router.post('/register/resend-otp', resendPhoneOTP);
router.post('/register/resend-email', resendVerificationEmail);

// Legacy registration (kept for backward compatibility)
router.post('/register', register);

// Login
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
