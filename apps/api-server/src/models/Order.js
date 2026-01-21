const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
        name: String,
        sku: String,
        price: Number,
        quantity: Number
    }],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['Prepaid', 'COD'],
        required: true,
        default: 'Prepaid'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String
    },
    history: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        comment: String
    }],
    refunds: [{
        refundId: String,
        amount: Number,
        status: String,
        reason: String,
        createdAt: { type: Date, default: Date.now }
    }],
    trackingId: String,
    courierPartner: String
}, { timestamps: true });

// Middleware to log status changes
orderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.history.push({
            status: this.status,
            comment: `Order status changed to ${this.status}`
        });
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
