require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const email = 'sparsh42005@gmail.com';

        // Check if already exists
        const exists = await Admin.findOne({ email });
        if (exists) {
            console.log('Admin already exists.');
            process.exit(0);
        }

        console.log('Creating Admin account...');
        await Admin.create({
            username: 'SparshAdmin',
            email: email,
            password: '123456789', // Pre-save hook will hash this
            role: 'SuperAdmin',
            isActive: true
        });

        console.log('Admin account created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
