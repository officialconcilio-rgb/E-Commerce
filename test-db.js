const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI ? 'Defined' : 'Not Defined');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err.message);
        process.exit(1);
    }
};

testConnection();
