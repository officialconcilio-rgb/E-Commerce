const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, index: true }, // Optional - auto-generated if not provided
    size: { type: String, required: true },
    color: { type: String, required: true },
    priceOverride: Number,
    stockQuantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Variant', variantSchema);
