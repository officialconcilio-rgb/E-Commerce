require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Variant = require('./models/Variant');
const User = require('./models/User');
const Admin = require('./models/Admin');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Coupon = require('./models/Coupon');
const Payment = require('./models/Payment');
const Review = require('./models/Review');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');

        // Clear ALL existing data
        console.log('Clearing all data...');
        await Category.deleteMany();
        await Product.deleteMany();
        await Variant.deleteMany();
        await Admin.deleteMany();
        await User.deleteMany();
        await Order.deleteMany();
        await Cart.deleteMany();
        await Coupon.deleteMany();
        await Payment.deleteMany();
        await Review.deleteMany();
        console.log('All data cleared.');

        // Create Admin
        await Admin.create({
            username: 'admin',
            email: 'admin@brand.com',
            password: 'adminpassword123',
            role: 'SuperAdmin'
        });
        console.log('Admin created.');

        // Create Categories
        const men = await Category.create({ name: 'Men', slug: 'men', description: 'Mens clothing' });
        const women = await Category.create({ name: 'Women', slug: 'women', description: 'Womens clothing' });

        // Create Products
        const shirt = await Product.create({
            name: 'Classic White Shirt',
            slug: 'classic-white-shirt',
            description: 'A premium cotton white shirt for formal occasions.',
            basePrice: 1999,
            category: men._id,
            images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'],
            tags: ['formal', 'white', 'cotton']
        });

        const dress = await Product.create({
            name: 'Summer Floral Dress',
            slug: 'summer-floral-dress',
            description: 'Lightweight floral dress for summer days.',
            basePrice: 2499,
            category: women._id,
            images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
            tags: ['summer', 'floral', 'dress']
        });

        // Create Variants
        await Variant.create([
            { productId: shirt._id, sku: 'SHIRT-WHT-S', size: 'S', color: 'White', stockQuantity: 50 },
            { productId: shirt._id, sku: 'SHIRT-WHT-M', size: 'M', color: 'White', stockQuantity: 100 },
            { productId: dress._id, sku: 'DRESS-FLR-S', size: 'S', color: 'Floral', stockQuantity: 30 }
        ]);

        console.log('Seed data inserted successfully.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
