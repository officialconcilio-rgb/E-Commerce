const User = require('../models/User');
const Product = require('../models/Product');

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            wishlist: user.wishlist || []
        });
    } catch (error) {
        console.error('[WISHLIST] Error fetching wishlist:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle wishlist (add or remove)
exports.toggleWishlist = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        // Check if product is already in wishlist (ensure string comparison)
        const existingIndex = user.wishlist.findIndex(id => id.toString() === productId);

        if (existingIndex > -1) {
            // Remove
            user.wishlist.splice(existingIndex, 1);
        } else {
            // Add (prevent duplicates)
            user.wishlist.push(productId);
        }

        await user.save();
        res.status(200).json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
