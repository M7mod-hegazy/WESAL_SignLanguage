const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('../models/Post');
const SharedPost = require('../models/SharedPost');
const User = require('../models/User');

const clearAllPosts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all posts
    const postsResult = await Post.deleteMany({});
    console.log(`🗑️ Deleted ${postsResult.deletedCount} posts`);

    // Delete all shared posts
    const sharedPostsResult = await SharedPost.deleteMany({});
    console.log(`🗑️ Deleted ${sharedPostsResult.deletedCount} shared posts`);

    // Clear savedPosts from all users
    const usersResult = await User.updateMany(
      {},
      { $set: { savedPosts: [] } }
    );
    console.log(`🧹 Cleared savedPosts from ${usersResult.modifiedCount} users`);

    console.log('\n✅ All posts cleared successfully!');
    console.log('\n📝 To clear localStorage:');
    console.log('   Open browser console and run:');
    console.log('   localStorage.clear()');
    console.log('   OR');
    console.log('   localStorage.removeItem("userSavedPosts")');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing posts:', error);
    process.exit(1);
  }
};

clearAllPosts();
