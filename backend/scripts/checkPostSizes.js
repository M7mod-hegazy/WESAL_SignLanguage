const mongoose = require('mongoose');
require('dotenv').config();

const checkPostSizes = async () => {
  console.log('🔍 Checking Post Sizes and Media Storage\n');
  console.log('=' .repeat(60));
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/signlanguage');
    console.log('✅ Connected to MongoDB\n');
    
    const Post = require('../models/Post');
    
    // Get all posts
    const posts = await Post.find().lean();
    console.log(`📊 Total posts: ${posts.length}\n`);
    
    if (posts.length === 0) {
      console.log('⚠️  No posts found in database');
      process.exit(0);
    }
    
    // Analyze each post
    let totalSize = 0;
    let postsWithMedia = 0;
    let totalMediaItems = 0;
    let largestPost = null;
    let largestSize = 0;
    
    posts.forEach((post, index) => {
      const postJson = JSON.stringify(post);
      const postSize = Buffer.byteLength(postJson, 'utf8');
      totalSize += postSize;
      
      if (postSize > largestSize) {
        largestSize = postSize;
        largestPost = post;
      }
      
      console.log(`\n📝 Post ${index + 1}:`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Size: ${(postSize / 1024).toFixed(2)} KB`);
      console.log(`   Content length: ${post.content?.length || 0} chars`);
      console.log(`   Media items: ${post.media?.length || 0}`);
      console.log(`   Comments: ${post.comments?.length || 0}`);
      console.log(`   Likes: ${post.likes?.length || 0}`);
      
      if (post.media && post.media.length > 0) {
        postsWithMedia++;
        totalMediaItems += post.media.length;
        
        post.media.forEach((mediaItem, mediaIndex) => {
          const mediaSize = mediaItem.url ? Buffer.byteLength(mediaItem.url, 'utf8') : 0;
          const isBase64 = mediaItem.url?.startsWith('data:');
          
          console.log(`   Media ${mediaIndex + 1}:`);
          console.log(`      Type: ${mediaItem.type}`);
          console.log(`      Size: ${(mediaSize / 1024).toFixed(2)} KB`);
          console.log(`      Format: ${isBase64 ? '❌ BASE64 (SLOW!)' : '✅ URL'}`);
          
          if (isBase64) {
            console.log(`      ⚠️  WARNING: Base64 images are stored in MongoDB!`);
            console.log(`      💡 This causes MASSIVE slowdown!`);
          }
        });
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total posts:           ${posts.length}`);
    console.log(`Posts with media:      ${postsWithMedia}`);
    console.log(`Total media items:     ${totalMediaItems}`);
    console.log(`Total database size:   ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`Average post size:     ${(totalSize / posts.length / 1024).toFixed(2)} KB`);
    console.log(`Largest post size:     ${(largestSize / 1024).toFixed(2)} KB`);
    
    // Performance impact
    console.log('\n🎯 PERFORMANCE IMPACT:');
    const avgSize = totalSize / posts.length;
    if (avgSize > 100000) { // > 100KB
      console.log('❌ CRITICAL: Posts are too large!');
      console.log('   Average post size > 100KB');
      console.log('   This will cause SEVERE performance issues');
      console.log('\n💡 SOLUTION:');
      console.log('   1. Store images externally (Cloudinary, AWS S3, etc.)');
      console.log('   2. Store only URLs in MongoDB');
      console.log('   3. Clear existing posts with base64 images');
    } else if (avgSize > 10000) { // > 10KB
      console.log('⚠️  WARNING: Posts are larger than recommended');
      console.log('   Average post size > 10KB');
      console.log('   Consider optimizing media storage');
    } else {
      console.log('✅ GOOD: Post sizes are reasonable');
      console.log('   Average post size < 10KB');
    }
    
    // Show largest post details
    if (largestPost && largestSize > 50000) {
      console.log('\n🔍 LARGEST POST DETAILS:');
      console.log(`   ID: ${largestPost._id}`);
      console.log(`   Size: ${(largestSize / 1024).toFixed(2)} KB`);
      console.log(`   Content: ${largestPost.content?.substring(0, 50)}...`);
      console.log(`   Media items: ${largestPost.media?.length || 0}`);
      
      if (largestPost.media && largestPost.media.length > 0) {
        console.log('\n   Media breakdown:');
        largestPost.media.forEach((media, i) => {
          const size = media.url ? Buffer.byteLength(media.url, 'utf8') : 0;
          console.log(`   ${i + 1}. ${media.type}: ${(size / 1024).toFixed(2)} KB`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

checkPostSizes();
