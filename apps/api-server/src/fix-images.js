/**
 * Script to fix product images with broken URLs
 * Run with: node src/fix-images.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');

const fixImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        // Find products with broken image URLs
        const products = await Product.find({
            $or: [
                { 'images': { $regex: 'example.com' } },
                { 'images': { $regex: '1769106668268' } } // The missing image
            ]
        });

        console.log(`Found ${products.length} products with broken images`);

        // Placeholder images from Unsplash (fashion/clothing themed)
        const placeholderImages = [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500',
            'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500',
            'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=500',
        ];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const newImage = placeholderImages[i % placeholderImages.length];

            await Product.findByIdAndUpdate(product._id, {
                images: [newImage]
            });

            console.log(`Fixed: ${product.name} -> ${newImage}`);
        }

        // Also fix any products with the specific missing image
        const result = await Product.updateMany(
            { 'images': { $regex: '1769106668268' } },
            { $set: { images: [placeholderImages[0]] } }
        );

        console.log(`Updated ${result.modifiedCount} more products with missing local images`);

        console.log('Done! All broken images have been fixed.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixImages();
