const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: 'text' },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, index: 'text' },
    basePrice: { type: Number, required: true },
    discountPrice: Number,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: [String],
    tags: [{ type: String, index: true }],
    attributes: [{
        name: String,
        value: String
    }],
    isFeatured: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    metadata: Object
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
