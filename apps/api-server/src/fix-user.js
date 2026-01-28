require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const fixUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const email = 'sparsh42005@gmail.com';
        const user = await User.findOne({ email }).select('+password +isRegistrationComplete +isEmailVerified');

        if (!user) {
            console.log(`User ${email} not found!`);
        } else {
            console.log(`Found user: ${user.firstName} ${user.lastName}`);
            console.log(`Email Verified: ${user.isEmailVerified}`);
            console.log(`Registration Complete: ${user.isRegistrationComplete}`);
            console.log(`Has Password: ${!!user.password}`);

            if (!user.isRegistrationComplete) {
                console.log('Fixing registration status...');
                user.isRegistrationComplete = true;

                // If password is "123456789" (as claimed), ensure it is hashed if not already (though usually it is).
                // Re-saving triggers the pre-save hook which handles hashing if modified.
                // We'll trust the existing password if it exists, or user can reset.

                await user.save();
                console.log('User status updated to COMPLETE.');
            } else {
                console.log('User registration is already marked complete.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixUser();
