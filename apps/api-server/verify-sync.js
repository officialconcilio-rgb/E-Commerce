require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
const Variant = require('./src/models/Variant');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifySync() {
    try {
        console.log('--- VAGMI SYNC VERIFICATION START ---');

        // 1. Connection Check
        console.log('1. Verifying Database Connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to Database: ${mongoose.connection.name}`);
        console.log(`Using Collection: ${Product.collection.name}`);

        // 2. Data Contract Check
        console.log('\n2. Verifying Canonical Categories...');
        const categories = await Category.find({ isActive: true });
        const canonicalSlugs = ['traditional', 'festive', 'divine-idols', 'home-decor', 'corporate'];
        const existingSlugs = categories.map(c => c.slug);

        canonicalSlugs.forEach(slug => {
            if (existingSlugs.includes(slug)) {
                console.log(`[OK] Category slug found: ${slug}`);
            } else {
                console.log(`[FAIL] Category slug MISSING: ${slug}`);
            }
        });

        // 3. Admin Simulation: Create Product
        console.log('\n3. Simulating Admin Product Creation...');
        const testCategory = categories.find(c => c.slug === 'traditional');
        if (!testCategory) throw new Error('Traditional category not found. Seed the DB first.');

        const testProductData = {
            name: 'DEBUG TEST PRODUCT ' + Date.now(),
            slug: 'debug-test-product-' + Date.now(),
            description: 'Automated sync test product',
            price: 9999,
            category: testCategory._id,
            stock: 100,
            images: ['https://via.placeholder.com/400'],
            hoverImage: 'https://via.placeholder.com/400',
            isActive: true
        };

        const testProduct = await Product.create(testProductData);
        console.log(`[OK] Product created in DB: ${testProduct.name}`);

        // 4. API Visibility Test (All Products)
        console.log('\n4. Verifying API Visibility (All)...');
        const allRes = await axios.get(`${API_URL}/products`);
        const foundGlobally = allRes.data.products.find(p => p._id.toString() === testProduct._id.toString());
        if (foundGlobally) {
            console.log(`[OK] Product visible in global API list. Count: ${allRes.data.count}`);
        } else {
            console.log(`[FAIL] Product NOT visible in global API list!`);
        }

        // 5. API Visibility Test (Filtered)
        console.log('\n5. Verifying API Visibility (Filtered by Category)...');
        const filterRes = await axios.get(`${API_URL}/products?category=traditional`);
        const foundFiltered = filterRes.data.products.find(p => p._id.toString() === testProduct._id.toString());
        if (foundFiltered) {
            console.log(`[OK] Product visible in filtered API list (category=traditional).`);
        } else {
            console.log(`[FAIL] Product NOT visible in filtered API list!`);
        }

        // 6. Schema Compliance Check
        console.log('\n6. Verifying Schema Compliance in API Response...');
        const p = foundGlobally;
        const requiredFields = ['name', 'price', 'category', 'stock', 'images', 'hoverImage', 'isActive'];
        requiredFields.forEach(field => {
            if (p[field] !== undefined) {
                console.log(`[OK] Field present: ${field} = ${JSON.stringify(p[field])}`);
            } else {
                console.log(`[FAIL] Field MISSING in API response: ${field}`);
            }
        });

        // 7. Admin Simulation: Delete Product
        console.log('\n7. Simulating Admin Product Deletion...');
        await Product.findByIdAndDelete(testProduct._id);
        console.log(`[OK] Product deleted from DB.`);

        // 8. Final Visibility Check
        console.log('\n8. Verifying Product Removal from Storefront...');
        const finalRes = await axios.get(`${API_URL}/products`);
        const stillExists = finalRes.data.products.find(p => p._id.toString() === testProduct._id.toString());
        if (!stillExists) {
            console.log(`[OK] Product successfully removed from API.`);
        } else {
            console.log(`[FAIL] Product STILL VISIBLE in API after deletion!`);
        }

        console.log('\n--- VAGMI SYNC VERIFICATION COMPLETE ---');
        process.exit(0);

    } catch (error) {
        console.error('\n[CRITICAL FAIL] Verification interrupted:', error.message);
        process.exit(1);
    }
}

verifySync();
