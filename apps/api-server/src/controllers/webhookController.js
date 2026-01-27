const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const Variant = require('../models/Variant');

exports.handleRazorpayWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
        const razorpayOrderId = payload.payment.entity.order_id;
        const razorpayPaymentId = payload.payment.entity.id;

        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment && payment.status !== 'Captured') {
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.status = 'Captured';
            await payment.save();

            const order = await Order.findById(payment.orderId);
            if (order && order.paymentStatus !== 'Paid') {
                order.paymentStatus = 'Paid';
                order.status = 'Confirmed';
                await order.save();

                // Clear Cart & Update Stock (if not already done by verifyPayment)
                await Cart.findOneAndUpdate({ userId: order.userId }, { items: [] });
                for (const item of order.items) {
                    await Variant.findByIdAndUpdate(item.variantId, {
                        $inc: { stockQuantity: -item.quantity }
                    });
                }

                // Notify Admin
                const { createAdminNotification } = require('../utils/notificationService');
                await createAdminNotification({
                    title: 'New Prepaid Order (Webhook)',
                    message: `Order ${order.orderNumber} confirmed for ₹${order.finalAmount}`,
                    type: 'Order',
                    link: `/orders/${order._id}`
                });
            }
        }
    }

    if (event === 'payment.failed') {
        const razorpayOrderId = payload.payment.entity.order_id;
        const payment = await Payment.findOne({ razorpayOrderId });
        if (payment) {
            payment.status = 'Failed';
            await payment.save();

            const order = await Order.findById(payment.orderId);
            if (order) {
                order.paymentStatus = 'Failed';
                order.history.push({
                    status: 'Failed',
                    comment: 'Payment failed (Webhook)'
                });
                await order.save();
            }
        }
    }

    res.json({ status: 'ok' });
};
