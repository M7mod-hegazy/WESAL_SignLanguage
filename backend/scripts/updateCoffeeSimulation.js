/**
 * Update Coffee Simulation Questions in Database
 * Replaces existing coffee simulation questions with new videos and proper order
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://medohagaze3_db_user:275757@cluster0.okawlww.mongodb.net/signlanguage';

// Import Sign model
const Sign = require('../models/Sign');

// Coffee simulation questions with order (matching Sign schema)
const coffeeQuestions = [
  {
    order: 1,
    word: 'السلام عليكم',
    animation_url: '/videos/simulation/coffee/peace_be_upon_you_alpha.webm',
    difficulty: 'سهل',
    category: 'محاكاة المقهى',
    correctAnswer: 'السلام عليكم',
    wrongAnswer1: 'صباح الخير',
    wrongAnswer2: 'مساء الخير',
    wrongAnswer3: 'مرحبا',
    coinsReward: 50
  },
  {
    order: 2,
    word: 'وعليكم السلام',
    animation_url: '/videos/simulation/coffee/and_upon_you_peace_alpha.webm',
    difficulty: 'سهل',
    category: 'محاكاة المقهى',
    correctAnswer: 'وعليكم السلام',
    wrongAnswer1: 'أهلا وسهلا',
    wrongAnswer2: 'حياك الله',
    wrongAnswer3: 'مرحبا بك',
    coinsReward: 50
  },
  {
    order: 3,
    word: 'أريد كوبا من القهوة',
    animation_url: '/videos/simulation/coffee/i_want_cup_of_coffee_alpha.webm',
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    correctAnswer: 'أريد كوبا من القهوة',
    wrongAnswer1: 'أريد كوبا من الشاي',
    wrongAnswer2: 'أريد كوبا من الماء',
    wrongAnswer3: 'أريد عصيرا',
    coinsReward: 50
  },
  {
    order: 4,
    word: 'حسنا',
    animation_url: '/videos/simulation/coffee/okay_alpha.webm',
    difficulty: 'سهل',
    category: 'محاكاة المقهى',
    correctAnswer: 'حسنا',
    wrongAnswer1: 'نعم',
    wrongAnswer2: 'لا',
    wrongAnswer3: 'ربما',
    coinsReward: 50
  },
  {
    order: 5,
    word: 'تفضل بالجلوس',
    animation_url: '/videos/simulation/coffee/please_sit_down_alpha.webm',
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    correctAnswer: 'تفضل بالجلوس',
    wrongAnswer1: 'تفضل بالوقوف',
    wrongAnswer2: 'تفضل بالدخول',
    wrongAnswer3: 'تفضل بالخروج',
    coinsReward: 50
  },
  {
    order: 6,
    word: 'سأنتظرك',
    animation_url: '/videos/simulation/coffee/i_will_wait_for_you_alpha.webm',
    difficulty: 'متوسط',
    category: 'محاكاة المقهى',
    correctAnswer: 'سأنتظرك',
    wrongAnswer1: 'سأذهب',
    wrongAnswer2: 'سأعود',
    wrongAnswer3: 'سأبقى',
    coinsReward: 50
  },
  {
    order: 7,
    word: 'شكرا لمجيئك',
    animation_url: '/videos/simulation/coffee/thank_you_for_coming_alpha.webm',
    difficulty: 'سهل',
    category: 'محاكاة المقهى',
    correctAnswer: 'شكرا لمجيئك',
    wrongAnswer1: 'شكرا لك',
    wrongAnswer2: 'عفوا',
    wrongAnswer3: 'على الرحب والسعة',
    coinsReward: 50
  }
];

async function updateCoffeeSimulation() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete existing coffee simulation questions
    console.log('🗑️  Removing old coffee simulation questions...');
    const deleteResult = await Sign.deleteMany({ category: 'محاكاة المقهى' });
    console.log(`✅ Deleted ${deleteResult.deletedCount} old questions\n`);

    // Insert new coffee simulation questions
    console.log('📝 Inserting new coffee simulation questions...');
    const insertResult = await Sign.insertMany(coffeeQuestions);
    console.log(`✅ Inserted ${insertResult.length} new questions\n`);

    // Display inserted questions
    console.log('📋 Coffee Simulation Questions:');
    console.log('=' .repeat(70));
    insertResult.forEach((sign, index) => {
      console.log(`${index + 1}. Order: ${sign.order} | ${sign.word}`);
      console.log(`   Video: ${sign.animation_url}`);
      console.log(`   Difficulty: ${sign.difficulty} | Coins: ${sign.coinsReward}`);
      console.log(`   Correct: ${sign.correctAnswer}`);
      console.log(`   Wrong: ${sign.wrongAnswer1}, ${sign.wrongAnswer2}, ${sign.wrongAnswer3}`);
      console.log('-'.repeat(70));
    });

    console.log('\n✅ Coffee simulation updated successfully!');
    console.log('🎮 Ready to test at: http://localhost:3000/simulation-quiz');

  } catch (error) {
    console.error('❌ Error updating coffee simulation:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the update
updateCoffeeSimulation();
