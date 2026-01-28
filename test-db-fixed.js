const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');

// Fix for local DNS issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection (with DNS fix)...');
console.log('URI:', uri ? 'Defined' : 'UNDEFINED');

mongoose.connect(uri)
    .then(() => {
        console.log('SUCCESS: Connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE:', err.message);
        process.exit(1);
    });
