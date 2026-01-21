# Payment Sandbox Testing Guide

## Razorpay Test Mode Setup

### 1. Get Test Credentials
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Toggle to **Test Mode** (top-right switch)
3. Go to **Settings > API Keys**
4. Generate or copy your **Test API Key ID** and **Test Key Secret**
5. Update your `.env` file:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxx
   ```

### 2. Test Card Numbers

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Success | 4111 1111 1111 1111 | Any 3 digits | Any future date |
| Failure | 4000 0000 0000 0002 | Any 3 digits | Any future date |
| International | 4000 0035 6000 0008 | Any 3 digits | Any future date |

### 3. Test UPI IDs
- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

### 4. Test Net Banking
- Select any bank and use OTP: `1234`

---

## Testing Scenarios

### Scenario 1: Successful Payment
1. Add items to cart
2. Proceed to checkout
3. Select Prepaid payment
4. Use success card: `4111 1111 1111 1111`
5. **Expected**: Order confirmed, payment status = Paid

### Scenario 2: Failed Payment
1. Add items to cart
2. Proceed to checkout
3. Use failure card: `4000 0000 0000 0002`
4. **Expected**: Payment fails, order status = Pending, payment status = Failed

### Scenario 3: User Cancels Payment
1. Start checkout
2. Close Razorpay modal without completing
3. **Expected**: Order remains Pending, can retry payment

### Scenario 4: Double Payment Prevention
1. Complete payment successfully
2. Try to verify same payment again
3. **Expected**: "Payment already processed" error

### Scenario 5: COD Order
1. Add items to cart
2. Select COD payment method
3. **Expected**: Order created as Confirmed, no payment processing

---

## Webhook Testing

### Local Development
Use [ngrok](https://ngrok.com) to expose your local server:
```bash
ngrok http 5000
```

Configure Razorpay Webhook:
1. Go to **Settings > Webhooks**
2. Add webhook URL: `https://your-ngrok-url.ngrok.io/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret to your `.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

---

## Refund Testing

1. Find a completed order in Admin Panel
2. Click "Initiate Refund"
3. Enter amount and reason
4. **Expected**: Refund initiated, order.refunds updated

---

## Checklist Before Going Live

- [ ] Switch to Live API Keys
- [ ] Update webhook URL to production domain
- [ ] Test one real transaction with small amount
- [ ] Verify webhook is receiving events
- [ ] Check refund flow works
