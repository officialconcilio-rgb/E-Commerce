const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: Number,
    maxDiscount: Number,
    expiryDate: { type: Date, required: true },
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
