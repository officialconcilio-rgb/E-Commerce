const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[CRITICAL] MongoDB Connection Failed: ${error.message}`);
    console.warn('The server is running but database-dependent features will fail.');
    // Don't exit process, allow server to stay alive for debugging
  }
};

module.exports = connectDB;
