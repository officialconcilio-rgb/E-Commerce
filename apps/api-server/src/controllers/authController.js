const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sendOTP, generateOTP } = require('../utils/smsService');
const { sendVerificationEmail } = require('../utils/emailService');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// =====================================================
// MULTI-STEP REGISTRATION FLOW
// =====================================================

// @desc    Step 1: Initiate registration with phone number
// @route   POST /api/auth/register/phone
// @access  Public
exports.initiateRegistration = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide first name, last name, and phone number'
            });
        }

        // Clean phone number
        const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+?91/, '');

        // Check if phone already exists with completed registration
        const existingUser = await User.findOne({ phone: cleanPhone });
        if (existingUser && existingUser.isRegistrationComplete) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered. Please login instead.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (existingUser) {
            // Update existing incomplete registration
            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            existingUser.phoneOTP = otp;
            existingUser.phoneOTPExpiry = otpExpiry;
            await existingUser.save();
        } else {
            // Create new user with pending verification
            await User.create({
                firstName,
                lastName,
                phone: cleanPhone,
                email: `pending_${cleanPhone}@temp.local`, // Temporary placeholder
                phoneOTP: otp,
                phoneOTPExpiry: otpExpiry
            });
        }

        // Send OTP
        await sendOTP(cleanPhone, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your phone number',
            phone: cleanPhone
        });
    } catch (error) {
        console.error('[AUTH] Registration initiation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Step 2: Verify phone OTP
// @route   POST /api/auth/register/verify-phone
// @access  Public
exports.verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP are required'
            });
        }

        const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+?91/, '');

        const user = await User.findOne({ phone: cleanPhone })
            .select('+phoneOTP +phoneOTPExpiry');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please start registration again.'
            });
        }

        // Check OTP
        if (user.phoneOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check expiry
        if (user.phoneOTPExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Mark phone as verified
        user.isPhoneVerified = true;
        user.phoneOTP = undefined;
        user.phoneOTPExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Phone verified successfully. Please enter your email.',
            phone: cleanPhone
        });
    } catch (error) {
        console.error('[AUTH] Phone verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Step 3: Add email and send verification
// @route   POST /api/auth/register/email
// @access  Public
exports.addEmailAndVerify = async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone || !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and email are required'
            });
        }

        const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+?91/, '');

        // Check if email already exists
        const existingEmail = await User.findOne({
            email,
            isRegistrationComplete: true
        });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const user = await User.findOne({ phone: cleanPhone, isPhoneVerified: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Please verify your phone number first'
            });
        }

        // Update email and generate verification token
        user.email = email;
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, user.firstName, verificationToken);

        res.json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
            email
        });
    } catch (error) {
        console.error('[AUTH] Email verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Step 4: Verify email token
// @route   GET /api/auth/register/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // Hash the token to compare
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // First, try to find user with valid token
        let user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: new Date() }
        }).select('+emailVerificationToken +emailVerificationExpiry');

        if (!user) {
            // Token not found or expired - check if user already verified
            // Try to find by the hashed token even if expired (user might be clicking old link)
            user = await User.findOne({
                emailVerificationToken: hashedToken
            }).select('+emailVerificationToken');

            if (user && user.isEmailVerified) {
                // Already verified - generate temp token to continue
                const tempToken = jwt.sign(
                    { id: user._id, purpose: 'set-password' },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                return res.json({
                    success: true,
                    message: 'Email already verified. You can set your password.',
                    alreadyVerified: true,
                    tempToken,
                    user: {
                        firstName: user.firstName,
                        email: user.email
                    }
                });
            }

            // Check if any user with this email is already verified but incomplete registration
            // This handles the case where user verified but browser closed
            const verifiedUser = await User.findOne({
                isEmailVerified: true,
                isRegistrationComplete: false
            });

            if (verifiedUser) {
                const tempToken = jwt.sign(
                    { id: verifiedUser._id, purpose: 'set-password' },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                return res.json({
                    success: true,
                    message: 'Email already verified. You can set your password.',
                    alreadyVerified: true,
                    tempToken,
                    user: {
                        firstName: verifiedUser.firstName,
                        email: verifiedUser.email
                    }
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token. Please request a new verification email.'
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;
        await user.save();

        // Generate a temporary token for setting password
        const tempToken = jwt.sign(
            { id: user._id, purpose: 'set-password' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            message: 'Email verified successfully. You can now set your password.',
            tempToken,
            user: {
                firstName: user.firstName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('[AUTH] Email token verification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Step 5: Set password (final step)
// @route   POST /api/auth/register/set-password
// @access  Public (with temp token)
exports.setPassword = async (req, res) => {
    try {
        const { tempToken, password } = req.body;

        if (!tempToken || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please verify your email again.'
            });
        }

        if (decoded.purpose !== 'set-password') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        const user = await User.findById(decoded.id);

        if (!user || !user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email first'
            });
        }

        // Set password and complete registration
        user.password = password;
        user.isRegistrationComplete = true;
        await user.save();

        // Generate login token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration complete!',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('[AUTH] Set password error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend phone OTP
// @route   POST /api/auth/register/resend-otp
// @access  Public
exports.resendPhoneOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+?91/, '');

        const user = await User.findOne({ phone: cleanPhone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isPhoneVerified) {
            return res.status(400).json({
                success: false,
                message: 'Phone already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        user.phoneOTP = otp;
        user.phoneOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send OTP
        await sendOTP(cleanPhone, otp);

        res.json({
            success: true,
            message: 'OTP resent successfully'
        });
    } catch (error) {
        console.error('[AUTH] Resend OTP error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/register/resend-email
// @access  Public
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone number or email is required'
            });
        }

        let user;

        if (phone) {
            const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+?91/, '');
            user = await User.findOne({ phone: cleanPhone });
        } else if (email) {
            user = await User.findOne({ email, isRegistrationComplete: false });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please start registration again.'
            });
        }

        // If email is verified and registration is complete, don't allow resend
        if (user.isEmailVerified && user.isRegistrationComplete) {
            return res.status(400).json({
                success: false,
                message: 'Account already registered. Please login instead.'
            });
        }

        // If email is verified but registration not complete, generate temp token
        if (user.isEmailVerified && !user.isRegistrationComplete) {
            const tempToken = jwt.sign(
                { id: user._id, purpose: 'set-password' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.json({
                success: true,
                message: 'Email already verified. You can set your password.',
                alreadyVerified: true,
                tempToken
            });
        }

        // Update email if provided and different
        if (email && email !== user.email) {
            // Check if new email exists with complete registration
            const existingEmail = await User.findOne({
                email,
                isRegistrationComplete: true
            });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            user.email = email;
        }

        // Make sure we have a valid email
        if (!user.email || user.email.includes('@temp.local')) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send email
        await sendVerificationEmail(user.email, user.firstName, verificationToken);

        res.json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (error) {
        console.error('[AUTH] Resend email error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// =====================================================
// LEGACY ROUTES (kept for backward compatibility)
// =====================================================

// @desc    Register user (legacy - simple flow)
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
            password,
            phone: `legacy_${Date.now()}`, // Placeholder for legacy registrations
            isPhoneVerified: false,
            isEmailVerified: false,
            isRegistrationComplete: true // Mark as complete for legacy flow
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
