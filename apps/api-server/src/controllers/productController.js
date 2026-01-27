const Product = require('../models/Product');
const Category = require('../models/Category');
const Variant = require('../models/Variant');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (category) {
            const cat = await Category.findOne({ slug: category });
            if (cat) query.category = cat._id;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const { minPrice, maxPrice, minDiscount } = req.query;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (minDiscount) {
            query.discount = { $gte: Number(minDiscount) };
        }

        let sortQuery = { createdAt: -1 };
        if (sort === 'price_asc') sortQuery = { price: 1 };
        if (sort === 'price_desc') sortQuery = { price: -1 };

        console.log('[API] Incoming products query params:', req.query);
        console.log('[API] Final MongoDB query:', JSON.stringify(query));

        const products = await Product.find(query)
            .sort(sortQuery)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('category', 'name slug');

        const count = await Product.countDocuments(query);
        console.log('[API] Result count:', count);

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true })
            .populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const variants = await Variant.find({ productId: product._id, isActive: true });

        res.json({
            success: true,
            product,
            variants
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
