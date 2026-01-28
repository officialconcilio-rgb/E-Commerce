const axios = require('axios');

/**
 * Send OTP via Fast2SMS (Indian SMS Provider)
 * Fast2SMS offers free credits for testing and very affordable rates
 * 
 * @param {string} phoneNumber - 10-digit Indian mobile number (without +91)
 * @param {string} otp - One-time password to send
 */
exports.sendOTP = async (phoneNumber, otp) => {
    // Remove any spaces, dashes, or +91 prefix
    const cleanPhone = phoneNumber.replace(/[\s\-]/g, '').replace(/^\+?91/, '');

    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error('Invalid Indian mobile number');
    }

    // Check if SMS service is configured
    if (!process.env.FAST2SMS_API_KEY) {
        // Development fallback - log OTP to console
        console.log('================================================');
        console.log(`[SMS] DEV MODE - OTP for ${cleanPhone}: ${otp}`);
        console.log('================================================');

        if (process.env.NODE_ENV === 'development') {
            return { success: true, message: 'OTP logged to console (dev mode)' };
        }
        throw new Error('SMS service not configured. Please add FAST2SMS_API_KEY to .env');
    }

    try {
        // Fast2SMS Quick Transactional Route (DLT approved)
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'otp',
                variables_values: otp,
                flash: 0,
                numbers: cleanPhone
            },
            {
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.return === true) {
            console.log(`[SMS] OTP sent successfully to ${cleanPhone}`);
            return { success: true, requestId: response.data.request_id };
        } else {
            console.error('[SMS] Fast2SMS error:', response.data);
            throw new Error(response.data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('[SMS] Failed to send OTP:', error.response?.data || error.message);

        // Fallback to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('================================================');
            console.log(`[SMS] FALLBACK - OTP for ${cleanPhone}: ${otp}`);
            console.log('================================================');
            return { success: true, message: 'OTP logged to console (fallback)' };
        }

        throw error;
    }
};

/**
 * Generate a random 6-digit OTP
 */
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
