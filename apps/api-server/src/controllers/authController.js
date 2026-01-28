const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sendVerificationEmail, sendOTPEmail } = require('../utils/emailService');

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;

        if (!email || !firstName || !lastName || !phone) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists. Please login instead.',
                userExists: true
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create new user (unverified)
        user = await User.create({
            email,
            firstName,
            lastName,
            phone,
            emailOTP: otp,
            emailOTPExpiry: otpExpiry,
            isRegistrationComplete: false
        });

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: 'Registration initiated. OTP sent to your email.'
        });
    } catch (error) {
        console.error('[AUTH] Register error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Simulated Google Login (for demo/development)
// @route   POST /api/auth/google-simulated
// @access  Public
exports.googleSimulated = async (req, res) => {
    try {
        const { email, firstName, lastName, googleId } = req.body;

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                firstName,
                lastName,
                email,
                phone: `google_${googleId.slice(-6)}`, // Mock phone
                password: crypto.randomBytes(16).toString('hex'), // Random password
                isEmailVerified: true,
                isRegistrationComplete: true
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[AUTH] Simulated Google Login error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// =====================================================
// MULTI-STEP REGISTRATION FLOW
// =====================================================

// @desc    Initiate Email OTP Login/Signup
// @route   POST /api/auth/login/email
// @access  Public
exports.sendEmailLoginOTP = async (req, res) => {
    try {
        const { email, firstName, lastName, phone } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            // Validate if name and phone are provided for new users
            if (!firstName || !lastName || !phone) {
                return res.status(400).json({
                    success: false,
                    isNewUser: true,
                    message: 'Please provide your details to create an account'
                });
            }

            // Create new user
            user = await User.create({
                email,
                firstName,
                lastName,
                phone,
                emailOTP: otp,
                emailOTPExpiry: otpExpiry
            });
        } else {
            // Update OTP for existing user
            user.emailOTP = otp;
            user.emailOTPExpiry = otpExpiry;
            await user.save();
        }

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            isNewUser: !user.isRegistrationComplete,
            message: 'OTP sent to your email'
        });
    } catch (error) {
        console.error('[AUTH] Email OTP error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const otp = generateOTP();
        user.emailOTP = otp;
        user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTPEmail(email, otp);
        res.status(200).json({ success: true, message: 'New OTP sent' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/login/verify
// @access  Public
exports.verifyEmailLoginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email }).select('+emailOTP +emailOTPExpiry');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check OTP
        if (user.emailOTP !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Check expiry
        if (user.emailOTPExpiry < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Success
        user.isEmailVerified = true;
        user.emailOTP = undefined;
        user.emailOTPExpiry = undefined;
        user.isRegistrationComplete = true; // Mark as complete once verified via OTP
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: 'User'
            }
        });
    } catch (error) {
        console.error('[AUTH] Email OTP Verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Note: Multi-step phone registration and legacy registration functions have been removed
// in favor of the new Email OTP Passwordless Login system.
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user or admin
        let account = await User.findOne({ email }).select('+password');
        let type = 'user';

        if (!account) {
            account = await Admin.findOne({ email }).select('+password');
            type = 'admin';
        }

        if (!account) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if registration is complete (for users)
        if (type === 'user' && !account.isRegistrationComplete) {
            return res.status(401).json({
                success: false,
                message: 'Registration incomplete. Please complete your registration first.',
                incompleteRegistration: true,
                phone: account.phone
            });
        }

        if (!(await account.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Update last login
        account.lastLogin = new Date();
        await account.save();

        res.json({
            success: true,
            token: generateToken(account._id),
            type,
            user: {
                id: account._id,
                email: account.email,
                firstName: account.firstName || account.username,
                lastName: account.lastName || '',
                role: account.role || 'User',
                phone: account.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    const account = req.user || req.admin;
    res.json({
        success: true,
        user: account
    });
};

// @desc    Add new address
// @route   POST /api/auth/address
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country } = req.body;

        // Validate required fields
        if (!street || !city || !state || !zipCode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide street, city, state, and zip code'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create new address object
        const newAddress = {
            type: type || 'Home',
            street,
            city,
            state,
            zipCode,
            country: country || 'India',
            isDefault: user.addresses.length === 0 // First address is default
        };

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all addresses
// @route   GET /api/auth/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/auth/address/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { type, street, city, state, zipCode, country } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(addressId);

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Update address fields
        if (type) address.type = type;
        if (street) address.street = street;
        if (city) address.city = city;
        if (state) address.state = state;
        if (zipCode) address.zipCode = zipCode;
        if (country) address.country = country;

        await user.save();

        res.json({
            success: true,
            message: 'Address updated successfully',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const wasDefault = user.addresses[addressIndex].isDefault;
        user.addresses.splice(addressIndex, 1);

        // If we deleted the default address, set the first remaining one as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Set address as default
// @route   PUT /api/auth/address/:addressId/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Reset all addresses' default status
        user.addresses.forEach(addr => {
            addr.isDefault = addr._id.toString() === addressId;
        });

        await user.save();

        res.json({
            success: true,
            message: 'Default address updated',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update basic info
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            user.password = newPassword;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
