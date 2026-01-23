# Customer Registration & Verification Setup Guide

This guide explains the new multi-step customer registration flow and how to configure the required services.

## Overview of Changes

### 1. Customer Registration Flow (Multi-Step)

The new registration process follows this flow:

1. **Step 1: Phone & Name** - Customer enters their name and phone number
2. **Step 2: OTP Verification** - Customer receives SMS OTP and verifies their phone
3. **Step 3: Email** - Customer enters their email address
4. **Step 4: Email Verification** - Customer clicks verification link in email
5. **Step 5: Set Password** - After email verification, customer sets their password

### 2. Admin Panel - View Customer

- Customers can **no longer be edited** by admins
- The "Edit" button has been replaced with "View" button
- View Customer modal now shows:
  - Customer details (name, email, phone)
  - Verification status (phone ✓, email ✓)
  - Statistics (total orders, total spent, last order date)
  - Complete purchase history

### 3. Customer Data

Only the following fields are stored for customers:
- First Name
- Last Name
- Email (verified)
- Phone Number (verified)
- Addresses (customer-managed)

---

## Environment Configuration

Add the following variables to your `.env` file:

```env
# =====================================================
# EMAIL SERVICE (Gmail with App Password - FREE)
# =====================================================
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
STORE_NAME=Your Store Name

# =====================================================
# SMS SERVICE (Fast2SMS - Indian SMS Provider)
# =====================================================
FAST2SMS_API_KEY=your_fast2sms_api_key

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:3000
```

---

## How to Get the API Keys

### Gmail App Password (FREE - for Email Verification)

Gmail App Passwords allow your application to send emails through your Gmail account securely.

**Prerequisites:**
- A Gmail account
- 2-Factor Authentication (2FA) enabled on your Google account

**Steps:**

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click on "2-Step Verification"
   - Follow the setup process

2. **Create an App Password**:
   - Go to [App Passwords Page](https://myaccount.google.com/apppasswords)
   - Sign in if prompted
   - Under "Select app", choose "Mail"
   - Under "Select device", choose "Other (Custom name)"
   - Enter a name like "E-Commerce Store"
   - Click "Generate"
   - **Copy the 16-character password shown** (it looks like: `xxxx xxxx xxxx xxxx`)
   - Remove the spaces and paste into `.env` as `GMAIL_APP_PASSWORD`

**Example:**
```env
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=abcdwxyzefghijkl
```

**Note:** The app password is shown only once. Save it securely.

---

### Fast2SMS API Key (for SMS OTP)

Fast2SMS is an Indian SMS provider with affordable rates (~₹0.15/SMS) and free testing credits.

**Steps:**

1. **Create an Account**:
   - Go to [Fast2SMS Website](https://www.fast2sms.com)
   - Click "Sign Up" / "Register"
   - Fill in your details and verify your email/phone

2. **Get Your API Key**:
   - After login, go to "Dev API" section in the sidebar
   - Your API Key will be displayed
   - Click "Copy" to copy it
   - Paste it into your `.env` file

3. **Get Free Credits** (Optional):
   - New accounts get some free credits for testing
   - You can also verify your email/KYC for additional free credits

4. **DLT Registration** (Required for Production):
   - For production use in India, you need DLT registration
   - Fast2SMS guides you through this process
   - For development/testing, the quick transactional route works

**Example:**
```env
FAST2SMS_API_KEY=your_api_key_from_fast2sms_dashboard
```

---

## Development Mode (Without SMS)

If you don't have Fast2SMS configured, the system will:
1. Log the OTP to the server console
2. You can use this OTP for testing

Example log output:
```
================================================
[SMS] DEV MODE - OTP for 9876543210: 123456
================================================
```

---

## Testing the Flow

1. **Start the server**: `npm run dev`

2. **Go to Register page**: http://localhost:3000/register

3. **Enter your details**:
   - First Name, Last Name
   - Phone Number (10 digits)

4. **Check console for OTP** (if SMS not configured):
   - Look for the log message with your OTP

5. **Enter OTP** to verify phone

6. **Enter Email** and click "Send Verification Email"

7. **Check your Gmail inbox** for verification email
   - Click the "Verify Email Address" button

8. **Set your password** to complete registration

---

## API Endpoints

### Registration Flow

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/phone` | POST | Step 1: Initiate registration |
| `/api/auth/register/verify-phone` | POST | Step 2: Verify phone OTP |
| `/api/auth/register/email` | POST | Step 3: Add email |
| `/api/auth/register/verify-email/:token` | GET | Step 4: Verify email |
| `/api/auth/register/set-password` | POST | Step 5: Set password |
| `/api/auth/register/resend-otp` | POST | Resend phone OTP |
| `/api/auth/register/resend-email` | POST | Resend verification email |

### Admin - Customers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/customers` | GET | List all customers |
| `/api/admin/customers/:id` | GET | Get customer with purchase history |
| `/api/admin/customers/:id` | DELETE | Deactivate customer |

**Note:** PUT (update) is no longer available for customers.

---

## Troubleshooting

### "Email not sending"
- Check if GMAIL_USER and GMAIL_APP_PASSWORD are correct
- Make sure 2FA is enabled on your Google account
- Try generating a new App Password

### "OTP not received"
- Check server console for logged OTP (development mode)
- Verify FAST2SMS_API_KEY is correct
- Check your Fast2SMS account for credits

### "Verification link not working"
- Ensure FRONTEND_URL is set correctly in .env
- Token expires after 24 hours
- Try requesting a new verification email

---

## Cost Estimates

| Service | Free Tier | Paid Rate |
|---------|-----------|-----------|
| Gmail | 500 emails/day | FREE |
| Fast2SMS | Free credits on signup | ~₹0.15-0.20/SMS |

For a small e-commerce store, these costs are minimal!
