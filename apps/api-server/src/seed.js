require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Variant = require('./models/Variant');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Coupon = require('./models/Coupon');
const Payment = require('./models/Payment');
const Review = require('./models/Review');

const seedData = async () => {
    try {
        console.log('Connecting to DB for seeding...');
        await mongoose.connect(process.env.MONGODB_URI);

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
            email: 'admin@vagmi.com',
            password: 'adminpassword123',
            role: 'SuperAdmin'
        });
        console.log('Admin created.');

        // Create Categories
        const categories = [
            { name: 'Traditional', slug: 'traditional', description: 'Graceful traditional gifts' },
            { name: 'Festive', slug: 'festive', description: 'Gifts for every celebration' },
            { name: 'Divine Idols', slug: 'divine-idols', description: 'Handcrafted spiritual idols' },
            { name: 'Home Decor', slug: 'home-decor', description: 'Elegant home styling items' },
            { name: 'Corporate', slug: 'corporate', description: 'Professional gift sets' },
            { name: 'Men', slug: 'men', description: 'Gifts for men' },
            { name: 'Women', slug: 'women', description: 'Gifts for women' }
        ];

        const createdCategories = {};
        for (const cat of categories) {
            const newCat = await Category.create(cat);
            createdCategories[cat.slug] = newCat;
        }
        console.log('Categories created.');

        // Demo Products Data
        const productsData = [
            {
                name: 'Traditional Brass Diya Set',
                slug: 'brass-diya-set',
                description: 'Handcrafted premium brass diya set for auspicious occasions. Perfect for Diwali and daily pooja.',
                price: 1299,
                discount: 30,
                discountPrice: 899,
                category: createdCategories['traditional']._id,
                subCategory: 'Lighting',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=90&fit=crop',
                    'https://images.unsplash.com/photo-1542617300-4b531405a76c?w=800&q=90&fit=crop'
                ],
                hoverImage: 'https://images.unsplash.com/photo-1542617300-4b531405a76c?w=800&q=90&fit=crop',
                tags: ['traditional', 'brass', 'diya'],
                stock: 50,
                isFeatured: true
            },
            {
                name: 'Handcrafted Ganesh Idol',
                slug: 'ganesh-idol',
                description: 'Intricately detailed Ganesh idol made by skilled Indian artisans. High-quality polish and finish.',
                price: 2499,
                discount: 28,
                discountPrice: 1799,
                category: createdCategories['divine-idols']._id,
                subCategory: 'Statues',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1590073844006-3a78a7820ecf?w=800&q=90&fit=crop',
                    'https://images.unsplash.com/photo-1567591974584-f2857563b28a?w=800&q=90&fit=crop'
                ],
                hoverImage: 'https://images.unsplash.com/photo-1567591974584-f2857563b28a?w=800&q=90&fit=crop',
                tags: ['idol', 'ganesh', 'spiritual'],
                stock: 20,
                isFeatured: true
            },
            {
                name: 'Silver Plated Pooja Thali',
                slug: 'silver-pooja-thali',
                description: 'Complete pooja thali set with silver plating. Includes diya, bell, and multi-purpose containers.',
                price: 3499,
                discount: 20,
                discountPrice: 2799,
                category: createdCategories['traditional']._id,
                subCategory: 'Pooja Items',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1563820245258-0678eb6ee933?w=800&q=90&fit=crop'
                ],
                tags: ['pooja', 'silver', 'traditional'],
                stock: 15
            },
            {
                name: 'Decorative Brass Lamp',
                slug: 'brass-lamp',
                description: 'Tall decorative brass lamp that adds a touch of elegance to any room. Inspired by traditional Kerala lamps.',
                price: 1899,
                discount: 21,
                discountPrice: 1499,
                category: createdCategories['home-decor']._id,
                subCategory: 'Lamps',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1615873968403-89e068625f40?w=800&q=90&fit=crop'
                ],
                tags: ['decor', 'brass', 'lamp'],
                stock: 15,
                isFeatured: true
            },
            {
                name: 'Premium Gift Hamper',
                slug: 'gift-hamper',
                description: 'A curated selection of our best items including dry fruits, chocolates and a luxury candle.',
                price: 3999,
                discount: 25,
                discountPrice: 2999,
                category: createdCategories['corporate']._id,
                subCategory: 'Gifts',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=90&fit=crop'
                ],
                tags: ['gift', 'hamper', 'premium'],
                stock: 10
            },
            {
                name: 'Wall Hanging Ganesha',
                slug: 'wall-hanging-ganesha',
                description: 'Artistic wall hanging Ganesha idol for home entrance or living room decor.',
                price: 999,
                discount: 10,
                discountPrice: 899,
                category: createdCategories['home-decor']._id,
                subCategory: 'Wall Decor',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1582234373447-0683057e93f8?w=800&q=90&fit=crop'
                ],
                tags: ['ganesha', 'decor', 'art'],
                stock: 30
            },
            {
                name: 'Festive Sweet Box',
                slug: 'festive-sweet-box',
                description: 'Assorted premium sweets in a designer box. Perfect for festive gifting.',
                price: 1499,
                discount: 15,
                discountPrice: 1274,
                category: createdCategories['festive']._id,
                subCategory: 'Food',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1589118949245-7d48d54101cc?w=800&q=90&fit=crop'
                ],
                tags: ['festive', 'sweets', 'gift'],
                stock: 100
            },
            {
                name: 'Marble Radha Krishna Statue',
                slug: 'radha-krishna-marble',
                description: 'Beautiful Radha Krishna statue made of pure white marble with gold work.',
                price: 8999,
                discount: 11,
                discountPrice: 7999,
                category: createdCategories['divine-idols']._id,
                subCategory: 'Statues',
                brand: 'Vagmi Heritage',
                images: [
                    'https://images.unsplash.com/photo-1544158428-21d743a411e4?w=800&q=90&fit=crop'
                ],
                tags: ['radha', 'krishna', 'marble', 'spiritual'],
                stock: 5
            },
            {
                name: 'Corporate Desk Organizer',
                slug: 'desk-organizer',
                description: 'Elegant leather and wood desk organizer set for professional gifting.',
                price: 2499,
                discount: 20,
                discountPrice: 1999,
                category: createdCategories['corporate']._id,
                subCategory: 'Office',
                brand: 'Vagmi Pro',
                images: [
                    'https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?w=800&q=90&fit=crop'
                ],
                tags: ['corporate', 'office', 'organizer'],
                stock: 25
            },
            {
                name: 'Royal Copper Drinkware Set',
                slug: 'copper-drinkware',
                description: 'Health-beneficial copper bottle and glass set with exquisite hammered pattern.',
                price: 1999,
                discount: 15,
                discountPrice: 1699,
                category: createdCategories['traditional']._id,
                subCategory: 'Health',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=90&fit=crop'
                ],
                tags: ['copper', 'health', 'traditional'],
                stock: 40
            },
            {
                name: 'Classic Cotton Shirt',
                slug: 'classic-cotton-shirt',
                description: 'Premium quality breathable cotton shirt for men. Perfect for formal and semi-formal occasions.',
                price: 1599,
                discount: 25,
                discountPrice: 1199,
                category: createdCategories['men']._id,
                subCategory: 'Apparel',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=90&fit=crop',
                    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=90&fit=crop'
                ],
                tags: ['men', 'shirt', 'cotton'],
                stock: 100
            },
            {
                name: 'Summer Floral Dress',
                slug: 'summer-floral-dress',
                description: 'Elegant and comfortable floral dress for women. Made from premium lightweight fabric.',
                price: 2999,
                discount: 33,
                discountPrice: 1999,
                category: createdCategories['women']._id,
                subCategory: 'Apparel',
                brand: 'Vagmi',
                images: [
                    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=90&fit=crop',
                    'https://images.unsplash.com/photo-1581067723212-6338c5884278?w=800&q=90&fit=crop'
                ],
                tags: ['women', 'dress', 'summer'],
                stock: 75
            }
        ];

        const createdProducts = [];
        for (const p of productsData) {
            const product = await Product.create(p);
            createdProducts.push(product);

            // Create a default variant for each
            await Variant.create({
                productId: product._id,
                sku: `VG-${p.slug.toUpperCase()}`,
                size: 'Standard',
                color: 'Default',
                priceOverride: p.discountPrice,
                stockQuantity: p.stock
            });
        }

        console.log(`${createdProducts.length} Products and variants created.`);
        console.log('Vagmi seed data inserted successfully.');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
