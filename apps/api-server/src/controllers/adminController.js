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
        // 1. Total Revenue (Paid orders)
        const totalSales = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$finalAmount' } } }
        ]);

        // 2. Counts
        const orderCount = await Order.countDocuments();
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments({ isActive: true });

        // 3. Sales Chart Data (Last 7 Days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        last7Days.setHours(0, 0, 0, 0);

        const salesDataRaw = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days },
                    paymentStatus: 'Paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$finalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill missing days
        const salesData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const found = salesDataRaw.find(item => item._id === dateStr);

            // Format day name (Mon, Tue, etc.)
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            salesData.push({
                name: dayName,
                date: dateStr,
                sales: found ? found.sales : 0
            });
        }

        // 4. Top Categories (by items sold)
        const topCategories = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category.name",
                    count: { $sum: "$items.quantity" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 4 }
        ]);

        // Calculate percentages for categories
        const totalCategoryItems = topCategories.reduce((acc, curr) => acc + curr.count, 0);
        const categoriesWithPercent = topCategories.map(cat => ({
            name: cat._id,
            count: cat.count,
            percentage: totalCategoryItems > 0 ? Math.round((cat.count / totalCategoryItems) * 100) : 0
        }));

        res.json({
            success: true,
            stats: {
                revenue: totalSales[0]?.total || 0,
                orders: orderCount,
                products: productCount,
                users: userCount,
                salesChart: salesData,
                topCategories: categoriesWithPercent
            }
        });
    } catch (error) {
        console.error('Analytics Error:', error);
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

// @desc    Get Single Customer with Order History
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
exports.getCustomerWithOrders = async (req, res) => {
    try {
        const customer = await User.findById(req.params.id).select('-password');
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Get customer's orders
        const orders = await Order.find({ userId: req.params.id })
            .sort({ createdAt: -1 })
            .select('orderNumber status paymentStatus finalAmount createdAt items');

        // Calculate customer statistics
        const totalOrders = orders.length;
        const totalSpent = orders
            .filter(o => o.paymentStatus === 'Paid')
            .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
        const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

        res.json({
            success: true,
            customer: {
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                isEmailVerified: customer.isEmailVerified,
                isPhoneVerified: customer.isPhoneVerified,
                createdAt: customer.createdAt,
                lastLogin: customer.lastLogin,
                addresses: customer.addresses
            },
            stats: {
                totalOrders,
                totalSpent,
                lastOrderDate
            },
            orders: orders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                amount: order.finalAmount,
                date: order.createdAt,
                itemCount: order.items?.length || 0
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Note: updateCustomer has been removed - customers cannot be edited by admin
// Customers can only update their own profile through their account settings


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
