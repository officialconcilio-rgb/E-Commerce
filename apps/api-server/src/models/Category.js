const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: String,
    isActive: { type: Boolean, default: true },
    metadata: {
        title: String,
        description: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
