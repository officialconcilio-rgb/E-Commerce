require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Variant = require('./models/Variant');
const User = require('./models/User');
const Admin = require('./models/Admin');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');

        // Clear existing data
        await Category.deleteMany();
        await Product.deleteMany();
        await Variant.deleteMany();
        await Admin.deleteMany();
        await User.deleteMany();

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
            images: ['https://example.com/shirt.jpg'],
            tags: ['formal', 'white', 'cotton']
        });

        const dress = await Product.create({
            name: 'Summer Floral Dress',
            slug: 'summer-floral-dress',
            description: 'Lightweight floral dress for summer days.',
            basePrice: 2499,
            category: women._id,
            images: ['https://example.com/dress.jpg'],
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
