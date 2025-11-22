const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Sign = require('../models/Sign');

const coffeeShopSigns = [
  {
    word: 'محاكاة_مقهى_1',
    correctAnswer: 'السلام عيكم',
    wrongAnswer1: 'صباح الخير',
    wrongAnswer2: 'مساء الخير',
    wrongAnswer3: 'مرحبا',
    animation_url: '/videos/coffee/1_greeting.webm',
    animationData: null, // Using video instead
    duration: 5,
    difficulty: 'سهل',
    category: 'محاكاة المقهى',
    order: 1,
    coinsReward: 50
  },
  {
    word: 'محاكاة_مقهى_2',
    correctAnswer: 'اريد كوبا من القهوه',
    wrongAnswer1: 'اريد كوبا من الشاي',
    wrongAnswer2: 'اريد كوبا من الماء',
    wrongAnswer3: 'اريد عصيرا',
    animation_url: '/videos/coffee/2_order_coffee.webm',
    animationData: null,
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 2,
    coinsReward: 50
  },
  {
    word: 'محاكاة_مقهى_3',
    correctAnswer: 'حسنا',
    wrongAnswer1: 'نعم',
    wrongAnswer2: 'لا',
    wrongAnswer3: 'ربما',
    animation_url: '/videos/coffee/3_okay.webm',
    animationData: null,
    duration: 5,
    difficulty: 'سهل',
    category: 'محاكاة المقهى',
    order: 3,
    coinsReward: 50
  },
  {
    word: 'محاكاة_مقهى_4',
    correctAnswer: 'تفضل بالجلوس',
    wrongAnswer1: 'تفضل بالوقوف',
    wrongAnswer2: 'تفضل بالدخول',
    wrongAnswer3: 'تفضل بالخروج',
    animation_url: '/videos/coffee/4_please_sit.webm',
    animationData: null,
    duration: 5,
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    order: 4,
    coinsReward: 50
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
