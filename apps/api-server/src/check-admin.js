require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const User = require('./models/User');

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const email = 'sparsh42005@gmail.com';

        // Check Admin Collection
        const admin = await Admin.findOne({ email });
        if (admin) {
            console.log(`[ADMIN] Found admin: ${admin.username} (${admin.role})`);
        } else {
            console.log(`[ADMIN] Email ${email} is NOT in Admin collection.`);
        }

        // Check User Collection
        const user = await User.findOne({ email });
        if (user) {
            console.log(`[USER] Found user: ${user.firstName}`);
        } else {
            console.log(`[USER] Email ${email} is NOT in User collection.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
