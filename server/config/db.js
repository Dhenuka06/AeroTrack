const mongoose = require('mongoose');

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aqi_aggregator';
  try {
    console.log(`[Database] Connecting to: ${connUri} ...`);
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] ✓ Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] ✗ Connection failed: ${error.message}`);
    console.error(`[Database] Make sure MongoDB is running on your machine.`);
    // Do NOT exit — let the server still boot so API health endpoint works
  }
};

module.exports = connectDB;
