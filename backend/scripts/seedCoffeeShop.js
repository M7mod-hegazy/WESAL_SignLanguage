const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Sign = require('../models/Sign');

const coffeeShopSigns = [
  {
    word: 'محاكاة_مقهى_1',
    correctAnswer: 'مرحباً، كيف حالك اليوم؟',
    wrongAnswer1: 'أود كأس قهوة من فضلك',
    wrongAnswer2: 'شكراً جزيلاً',
    wrongAnswer3: 'مع السلامة',
    animation_url: '/videos/coffee/scene1.webm',
    animationData: null, // Using video instead
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 1,
    coinsReward: 10
  },
  {
    word: 'محاكاة_مقهى_2',
    correctAnswer: 'أود كأس قهوة كبيرة من فضلك',
    wrongAnswer1: 'مرحباً، كيف حالك؟',
    wrongAnswer2: 'هل يمكن أن تكون باردة؟',
    wrongAnswer3: 'شكراً جزيلاً',
    animation_url: '/videos/coffee/scene2.webm',
    animationData: null,
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 2,
    coinsReward: 10
  },
  {
    word: 'محاكاة_مقهى_3',
    correctAnswer: 'مع الحليب والقليل من السكر',
    wrongAnswer1: 'بدون سكر من فضلك',
    wrongAnswer2: 'أود كأس قهوة',
    wrongAnswer3: 'هل يمكن أن تكون ساخنة؟',
    animation_url: '/videos/coffee/scene3.webm',
    animationData: null,
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 3,
    coinsReward: 10
  },
  {
    word: 'محاكاة_مقهى_4',
    correctAnswer: 'هل يمكن أن تكون ساخنة، من فضلك؟',
    wrongAnswer1: 'هل يمكن أن تكون باردة؟',
    wrongAnswer2: 'مع الحليب من فضلك',
    wrongAnswer3: 'شكراً جزيلاً',
    animation_url: '/videos/coffee/scene4.webm',
    animationData: null,
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 4,
    coinsReward: 10
  },
  {
    word: 'محاكاة_مقهى_5',
    correctAnswer: 'شكراً جزيلاً، سأنتظر هنا',
    wrongAnswer1: 'مع السلامة',
    wrongAnswer2: 'أود كأس قهوة',
    wrongAnswer3: 'مرحباً، كيف حالك؟',
    animation_url: '/videos/coffee/scene5.webm',
    animationData: null,
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 5,
    coinsReward: 10
  }
];

async function seedCoffeeShop() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing coffee shop signs
    await Sign.deleteMany({ category: 'محاكاة المقهى' });
    console.log('🗑️  Removed old coffee shop signs');

    // Insert new signs one by one to handle validation
    let insertedCount = 0;
    for (const signData of coffeeShopSigns) {
      try {
        await Sign.create(signData);
        insertedCount++;
        console.log(`✅ Added: ${signData.correctAnswer}`);
      } catch (error) {
        console.error(`❌ Failed to add ${signData.word}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully added ${insertedCount}/${coffeeShopSigns.length} coffee shop signs`);

    await mongoose.connection.close();
    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedCoffeeShop();
