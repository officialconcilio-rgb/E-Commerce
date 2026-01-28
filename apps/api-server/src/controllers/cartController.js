const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Variant = require('../models/Variant');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        let cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId', 'name slug price discountPrice images')
            .populate('items.variantId', 'size color sku stockQuantity priceOverride');

        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }

        res.json({ success: true, cart });
    } catch (error) {
        console.error('[CART] Error fetching cart:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { productId, variantId, quantity } = req.body;

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item =>
            item.variantId.toString() === variantId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, variantId, quantity });
        }

        await cart.save();
        res.json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update cart item quantity
// @route   PATCH /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { variantId, quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item =>
            item.variantId.toString() === variantId
        );

        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            } else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
        }

        res.json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:variantId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { variantId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const itemIndex = cart.items.findIndex(item =>
            item.variantId.toString() === variantId
        );

        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
            await cart.save();
        }

        // Re-populate for consistent response
        await cart.populate('items.productId', 'name slug price images');
        await cart.populate('items.variantId', 'size color sku stockQuantity priceOverride');

        res.json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
