const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('../models/Post');
const Story = require('../models/Story');

async function clearDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Clearing database...\n');

    // Clear Posts
    const postsDeleted = await Post.deleteMany({});
    console.log(`✅ Deleted ${postsDeleted.deletedCount} posts`);

    // Clear Stories
    const storiesDeleted = await Story.deleteMany({});
    console.log(`✅ Deleted ${storiesDeleted.deletedCount} stories`);

    console.log('\n✨ Database cleared successfully!');
    console.log('📊 Summary:');
    console.log(`   - Posts: ${postsDeleted.deletedCount} deleted`);
    console.log(`   - Stories: ${storiesDeleted.deletedCount} deleted`);
    console.log('\n⚠️  Note: Users and Signs were NOT deleted (kept for authentication and quiz)');

    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
