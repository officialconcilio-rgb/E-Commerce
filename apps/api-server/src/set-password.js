require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const setPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const email = 'sparsh42005@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found!`);
        } else {
            console.log(`Found user: ${user.firstName} ${user.lastName}`);

            console.log('Setting password to: 123456789');
            user.password = '123456789';
            user.isRegistrationComplete = true; // Ensure this is true

            // The pre-save hook in User.js will hash this password automatically
            await user.save();

            console.log('Password set successfully!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

setPassword();
