const mongoose = require('mongoose');

let isOfflineMode = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/anime_portfolio';
  
  try {
    console.log('⚡ Accessing database system...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000 // Quick failure if MongoDB is not running
    });
    console.log('🌸 Cyber-Link Established: Connected to MongoDB Atlas/Local.');
    isOfflineMode = false;
  } catch (error) {
    console.error('❌ Cyber-Link Failed: MongoDB is offline or unavailable.');
    console.warn('⚠️ Entering Autonomous Sandbox Mode: System will run with localized memory storage.');
    isOfflineMode = true;
  }
}

function getOfflineStatus() {
  return isOfflineMode;
}

module.exports = {
  connectDB,
  getOfflineStatus
};
