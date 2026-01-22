const Product = require('../models/Product');
const Category = require('../models/Category');
const Variant = require('../models/Variant');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Razorpay = require('razorpay');

// @desc    Create Product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        console.log('[ADMIN] Creating product:', req.body.name);

        // Create the product first
        const product = await Product.create(req.body);
        console.log('[ADMIN] Product created with ID:', product._id);

        // Create variants if provided
        if (req.body.variants && Array.isArray(req.body.variants) && req.body.variants.length > 0) {
            const variants = req.body.variants.map((v, index) => ({
                productId: product._id,
                size: v.size,
                color: v.color,
                stockQuantity: v.stockQuantity || 0,
                priceOverride: v.priceOverride,
                // Auto-generate SKU if not provided
                sku: v.sku || `${product.slug}-${v.size}-${v.color}-${index}`.toLowerCase().replace(/\s+/g, '-')
            }));

            console.log('[ADMIN] Creating variants:', variants.length);
            await Variant.insertMany(variants);
            console.log('[ADMIN] Variants created successfully');
        }

        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('[ADMIN] Error creating product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Order Details
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('userId', 'firstName lastName email');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Order Status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);

        const orderCount = await Order.countDocuments();
        const productCount = await Product.countDocuments();

        res.json({
            success: true,
            stats: {
                revenue: totalSales[0]?.total || 0,
                orders: orderCount,
                products: productCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, coupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Customers
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getCustomers = async (req, res) => {
    try {
        // Users collection contains customers (Admins are in separate collection)
        const customers = await User.find({ isActive: true }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Single Customer
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
exports.getCustomer = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id).select('-password');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Customer
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
exports.updateCustomer = async (req, res) => {
    try {
        const { firstName, lastName, phone, isActive } = req.body;

        const customer = await User.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Update fields if provided
        if (firstName !== undefined) customer.firstName = firstName;
        if (lastName !== undefined) customer.lastName = lastName;
        if (phone !== undefined) customer.phone = phone;
        if (isActive !== undefined) customer.isActive = isActive;

        await customer.save();

        res.json({
            success: true,
            message: 'Customer updated successfully',
            customer: {
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                isActive: customer.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Soft delete by setting isActive to false
        customer.isActive = false;
        await customer.save();

        res.json({ success: true, message: 'Customer deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Initiate Refund
// @route   POST /api/admin/orders/:id/refund
// @access  Private/Admin
exports.initiateRefund = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const payment = await Payment.findOne({ orderId: order._id, status: 'Captured' });
        if (!payment) {
            return res.status(400).json({ success: false, message: 'No captured payment found for this order' });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(amount * 100),
            notes: { reason }
        });

        order.refunds.push({
            refundId: refund.id,
            amount,
            status: refund.status,
            reason
        });

        if (amount >= order.finalAmount) {
            order.paymentStatus = 'Refunded';
        }

        await order.save();

        res.json({ success: true, refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Export Orders as CSV
// @route   GET /api/admin/orders/export
// @access  Private/Admin
exports.exportOrdersCSV = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'firstName lastName email phone')
            .sort({ createdAt: -1 });

        // CSV Header
        const headers = [
            'Order Number',
            'Date',
            'Customer Name',
            'Customer Email',
            'Phone',
            'Items',
            'Subtotal',
            'Discount',
            'Final Amount',
            'Payment Status',
            'Payment Method',
            'Order Status',
            'Shipping Address'
        ].join(',');

        // CSV Rows
        const rows = orders.map(order => {
            const customerName = order.userId
                ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim()
                : 'N/A';
            const customerEmail = order.userId?.email || 'N/A';
            const phone = order.userId?.phone || order.shippingAddress?.phone || 'N/A';

            // Format items
            const items = order.items?.map(item =>
                `${item.name || 'Product'} x${item.quantity}`
            ).join('; ') || 'N/A';

            // Format shipping address
            const addr = order.shippingAddress;
            const shippingAddress = addr
                ? `${addr.street || ''} ${addr.city || ''} ${addr.state || ''} ${addr.pincode || ''}`.replace(/,/g, ' ').trim()
                : 'N/A';

            return [
                order.orderNumber || order._id,
                new Date(order.createdAt).toLocaleString('en-IN'),
                `"${customerName}"`,
                customerEmail,
                phone,
                `"${items}"`,
                order.subtotal || 0,
                order.discount || 0,
                order.finalAmount || 0,
                order.paymentStatus || 'N/A',
                order.paymentMethod || 'N/A',
                order.status || 'N/A',
                `"${shippingAddress}"`
            ].join(',');
        });

        const csv = [headers, ...rows].join('\n');

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
