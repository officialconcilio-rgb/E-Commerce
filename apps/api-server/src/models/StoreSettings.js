const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
    freeShippingThreshold: {
        type: Number,
        default: 5000,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 150,
        required: true
    },
    returnPeriodDays: {
        type: Number,
        default: 30,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure only one settings document exists
storeSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
