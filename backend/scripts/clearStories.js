const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('../models/Story');
const User = require('../models/User');

const clearAllStories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all stories
    const storiesResult = await Story.deleteMany({});
    console.log(`🗑️ Deleted ${storiesResult.deletedCount} stories`);

    // Clear likedStories from all users
    const usersResult = await User.updateMany(
      {},
      { $set: { likedStories: [] } }
    );
    console.log(`🧹 Cleared likedStories from ${usersResult.modifiedCount} users`);

    console.log('\n✅ All stories cleared successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing stories:', error);
    process.exit(1);
  }
};

clearAllStories();
