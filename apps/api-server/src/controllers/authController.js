const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

        if (!account || !(await account.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json({
            success: true,
            token: generateToken(account._id),
            type,
            user: {
                id: account._id,
                email: account.email,
                firstName: account.firstName || account.username,
                lastName: account.lastName || '',
                role: account.role || 'User'
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
            user: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
