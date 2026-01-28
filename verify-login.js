require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Admin = require('./apps/api-server/src/models/Admin');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'admin@vagmi.com';
        const password = 'adminpassword123';

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            console.log('CRITICAL: Admin user not found! Seeding failed?');
        } else {
            console.log('Admin user found:', admin.email);
            console.log('Hashed Password:', admin.password);

            const isMatch = await admin.matchPassword(password);
            if (isMatch) {
                console.log('SUCCESS: Password match! Login should work.');
            } else {
                console.log('FAILURE: Password mismatch. Hashing issue?');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyLogin();
