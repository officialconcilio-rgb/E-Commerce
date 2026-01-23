const nodemailer = require('nodemailer');

// Create transporter using Gmail
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD // This is an App Password, not your regular Gmail password
        }
    });
};

/**
 * Send email verification link
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} verificationToken - Unique token for email verification
 */
exports.sendVerificationEmail = async (to, name, verificationToken) => {
    const transporter = createTransporter();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"${process.env.STORE_NAME || 'E-Commerce Store'}" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Verify Your Email Address',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #1e1e2d; padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">
                            ${process.env.STORE_NAME || 'E-Commerce Store'}
                        </h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1e1e2d; margin: 0 0 20px; font-size: 24px;">Hey ${name}! 👋</h2>
                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                            Thanks for signing up! Please verify your email address to complete your registration and start shopping.
                        </p>
                        <a href="${verificationUrl}" style="display: inline-block; background-color: #1e1e2d; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px;">
                            Verify Email Address
                        </a>
                        <p style="color: #999999; font-size: 14px; margin: 30px 0 0;">
                            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                        </p>
                    </div>
                    <div style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                        <p style="color: #999999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} ${process.env.STORE_NAME || 'E-Commerce Store'}. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Failed to send verification email:', error);
        // In development, log the verification URL so you can still test
        if (process.env.NODE_ENV === 'development') {
            console.log('[EMAIL] DEV MODE - Verification URL:', verificationUrl);
        }
        throw error;
    }
};

/**
 * Send OTP via email (fallback for SMS)
 * @param {string} to - Recipient email
 * @param {string} otp - One-time password
 */
exports.sendOTPEmail = async (to, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.STORE_NAME || 'E-Commerce Store'}" <${process.env.GMAIL_USER}>`,
        to,
        subject: `Your OTP: ${otp}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Your OTP</title>
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #1e1e2d; padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">
                            ${process.env.STORE_NAME || 'E-Commerce Store'}
                        </h1>
                    </div>
                    <div style="padding: 40px 30px; text-align: center;">
                        <h2 style="color: #1e1e2d; margin: 0 0 20px;">Your One-Time Password</h2>
                        <div style="background-color: #f0f0f0; padding: 30px; border-radius: 12px; margin: 20px 0;">
                            <span style="font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #1e1e2d;">${otp}</span>
                        </div>
                        <p style="color: #666666; font-size: 16px; margin: 20px 0 0;">
                            This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] OTP email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL] Failed to send OTP email:', error);
        throw error;
    }
};
