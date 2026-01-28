const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Product = require('./src/models/Product');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkImages = async () => {
    await connectDB();
    const products = await Product.find({}).select('name images');
    console.log(JSON.stringify(products, null, 2));
    process.exit();
};

checkImages();
