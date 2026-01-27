/**
 * Script to fix product images with broken URLs using high-quality Vagmi theme images
 * Run with: node src/fix-images.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

const VagmiImages = [
    'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800&q=90&fit=crop',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=90&fit=crop',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=90&fit=crop',
    'https://images.unsplash.com/photo-1590073844006-3a78a7820ecf?w=800&q=90&fit=crop',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=90&fit=crop',
    'https://images.unsplash.com/photo-1512418490979-92798cccbe3a?w=800&q=90&fit=crop',
];

const fixImages = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        // Find ALL products to ensure consistency
        const products = await Product.find({});
        console.log(`Processing ${products.length} products...`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            // If the image contains a known broken pattern or is just placeholderish
            const isBroken = product.images.some(img =>
                img.includes('1604423565793') ||
                img.includes('1582738411706') ||
                img.includes('1567591370504') ||
                img.includes('example.com') ||
                img.includes('1769106668268')
            );

            if (isBroken || product.images.length === 0) {
                const newImage = VagmiImages[i % VagmiImages.length];
                await Product.findByIdAndUpdate(product._id, {
                    images: [newImage]
                });
                console.log(`Fixed product: ${product.name}`);
            }
        }

        console.log('Success! Database images are now stable and beautiful.');
        process.exit(0);
    } catch (error) {
        console.error('Database connection or fix error:', error);
        process.exit(1);
    }
};

fixImages();
