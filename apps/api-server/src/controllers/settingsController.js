const StoreSettings = require('../models/StoreSettings');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
    try {
        const settings = await StoreSettings.getSettings();
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
    try {
        const { freeShippingThreshold, shippingCost, returnPeriodDays } = req.body;

        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = new StoreSettings();
        }

        settings.freeShippingThreshold = freeShippingThreshold;
        settings.shippingCost = shippingCost;
        settings.returnPeriodDays = returnPeriodDays;

        await settings.save();

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
