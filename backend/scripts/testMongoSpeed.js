const mongoose = require('mongoose');
require('dotenv').config();

const testMongoSpeed = async () => {
  console.log('🔍 MongoDB Performance Test\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Connection Speed
    console.log('\n📡 Test 1: Connection Speed');
    const connectStart = Date.now();
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signlanguage', {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    const connectTime = Date.now() - connectStart;
    console.log(`✅ Connected in ${connectTime}ms`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌍 Host: ${mongoose.connection.host}`);
    console.log(`⚡ State: ${mongoose.connection.readyState}`);
    
    // Test 2: Simple Query Speed
    console.log('\n📊 Test 2: Simple Query Speed');
    const Post = require('../models/Post');
    
    const queryStart = Date.now();
    const posts = await Post.find({ isPublic: true })
      .limit(10)
      .lean();
    const queryTime = Date.now() - queryStart;
    console.log(`✅ Query completed in ${queryTime}ms`);
    console.log(`📝 Found ${posts.length} posts`);
    
    // Test 3: Count Speed
    console.log('\n🔢 Test 3: Count Speed');
    const countStart = Date.now();
    const count = await Post.countDocuments({ isPublic: true });
    const countTime = Date.now() - countStart;
    console.log(`✅ Count completed in ${countTime}ms`);
    console.log(`📊 Total posts: ${count}`);
    
    // Test 4: User Lookup Speed
    console.log('\n👤 Test 4: User Lookup Speed');
    const User = require('../models/User');
    const userStart = Date.now();
    const users = await User.find().limit(1).lean();
    const userTime = Date.now() - userStart;
    console.log(`✅ User lookup in ${userTime}ms`);
    console.log(`👥 Sample user: ${users[0]?.email || 'No users found'}`);
    
    // Test 5: Index Check
    console.log('\n📇 Test 5: Index Check');
    const indexes = await Post.collection.getIndexes();
    console.log('Indexes on Post collection:');
    Object.keys(indexes).forEach(key => {
      console.log(`  - ${key}: ${JSON.stringify(indexes[key])}`);
    });
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 PERFORMANCE SUMMARY');
    console.log('='.repeat(50));
    console.log(`Connection:     ${connectTime}ms`);
    console.log(`Query (10):     ${queryTime}ms`);
    console.log(`Count:          ${countTime}ms`);
    console.log(`User Lookup:    ${userTime}ms`);
    console.log(`Total:          ${connectTime + queryTime + countTime + userTime}ms`);
    
    // Performance Rating
    const totalTime = connectTime + queryTime + countTime + userTime;
    console.log('\n🎯 RATING:');
    if (totalTime < 500) {
      console.log('✅ EXCELLENT - Very fast!');
    } else if (totalTime < 2000) {
      console.log('⚠️  GOOD - Acceptable performance');
    } else if (totalTime < 5000) {
      console.log('⚠️  SLOW - Consider optimization');
    } else {
      console.log('❌ VERY SLOW - Major performance issues!');
      console.log('\n💡 Possible issues:');
      console.log('   1. MongoDB Atlas is in a different region (high latency)');
      console.log('   2. Network connection is slow');
      console.log('   3. Database needs indexes');
      console.log('   4. Free tier MongoDB Atlas (M0) has limited performance');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testMongoSpeed();
