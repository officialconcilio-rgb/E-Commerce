const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Payment = require('../models/Payment');
const Variant = require('../models/Variant');
const StoreSettings = require('../models/StoreSettings');
const { generateInvoice } = require('../utils/invoice');
const path = require('path');
const fs = require('fs');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name images')
            .populate('items.variantId', 'size color');

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.productId', 'name images')
            .populate('items.variantId', 'size color');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if user owns the order
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create order & Razorpay order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { addressId, paymentMethod = 'Prepaid' } = req.body;
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId')
            .populate('items.variantId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // 1. Validate Stock (Optimistic Check)
        for (const item of cart.items) {
            if (item.variantId.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.productId.name} (${item.variantId.size})`
                });
            }
        }

        // Calculate total
        let totalAmount = 0;
        const orderItems = cart.items.map(item => {
            const price = item.variantId.priceOverride || item.productId.price;
            totalAmount += price * item.quantity;
            return {
                productId: item.productId._id,
                variantId: item.variantId._id,
                name: item.productId.name,
                sku: item.variantId.sku,
                price,
                quantity: item.quantity
            };
        });

        // Calculate Shipping
        const settings = await StoreSettings.getSettings();
        const shippingCost = totalAmount > settings.freeShippingThreshold ? 0 : settings.shippingCost;
        const finalAmount = totalAmount + shippingCost;

        // Create Local Order
        const order = await Order.create({
            orderNumber: `ORD-${Date.now()}`,
            userId: req.user._id,
            items: orderItems,
            totalAmount,
            finalAmount,
            shippingAddress: req.user.addresses.id(addressId),
            paymentMethod,
            status: paymentMethod === 'COD' ? 'Confirmed' : 'Pending',
            paymentStatus: 'Pending'
        });

        // Notify Admin
        const { createAdminNotification } = require('../utils/notificationService');
        await createAdminNotification({
            title: 'New COD Order',
            message: `Order ${order.orderNumber} placed for ₹${order.finalAmount}`,
            type: 'Order',
            link: `/orders/${order._id}`
        });

        return res.status(201).json({
            success: true,
            order,
            message: 'Order placed successfully (COD)'
        });

        // Create Razorpay Order for Prepaid
        const options = {
            amount: Math.round(finalAmount * 100),
            currency: 'INR',
            receipt: order.orderNumber
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Create Payment Record
        await Payment.create({
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: finalAmount,
            status: 'Created'
        });

        res.status(201).json({
            success: true,
            order,
            razorpayOrder
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Payment
// @route   POST /api/orders/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // 1. Duplicate Payment Protection
        const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id });
        if (existingPayment) {
            return res.status(400).json({ success: false, message: 'Payment already processed' });
        }

        // 2. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // 3. Update Payment & Order
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = 'Captured';
        await payment.save();

        const order = await Order.findById(payment.orderId);
        order.paymentStatus = 'Paid';
        order.status = 'Confirmed';
        order.paymentDetails = {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        };
        await order.save();

        // 4. Clear Cart
        await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

        // 6. Notify Admin
        const { createAdminNotification } = require('../utils/notificationService');
        await createAdminNotification({
            title: 'New Prepaid Order',
            message: `Order ${order.orderNumber} confirmed for ₹${order.finalAmount}`,
            type: 'Order',
            link: `/orders/${order._id}`
        });

        res.json({ success: true, message: 'Payment verified successfully', orderId: order._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Handle Failed Payment
// @route   POST /api/orders/failed
// @access  Private
exports.handleFailedPayment = async (req, res) => {
    try {
        const { razorpay_order_id, error_description } = req.body;

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
        if (payment) {
            payment.status = 'Failed';
            payment.rawResponse = req.body;
            await payment.save();

            const order = await Order.findById(payment.orderId);
            if (order) {
                order.paymentStatus = 'Failed';
                order.history.push({
                    status: 'Failed',
                    comment: `Payment failed: ${error_description}`
                });
                await order.save();
            }
        }

        res.json({ success: true, message: 'Failure recorded' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Download Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if user owns the order
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const invoicesDir = path.join(__dirname, '../../uploads/invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const fileName = `invoice_${order.orderNumber}.pdf`;
        const filePath = path.join(invoicesDir, fileName);

        await generateInvoice(order, filePath);

        res.download(filePath, fileName);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
