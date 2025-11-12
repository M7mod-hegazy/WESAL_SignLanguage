require('dotenv').config();
const mongoose = require('mongoose');
const Sign = require('../models/Sign');
const UserProgress = require('../models/UserProgress');
const {
  generateWaveAnimation,
  generateThumbsUpAnimation,
  generatePeaceSignAnimation
} = require('./generateAnimations');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/signlanguage';

// Sample signs data with Arabic answers
const sampleSigns = [
  {
    word: 'Hello',
    description: 'A friendly greeting gesture',
    difficulty: 'easy',
    animationData: null, // Will be generated
    correctAnswer: 'مرحبا',
    wrongAnswer1: 'وداعا',
    wrongAnswer2: 'شكرا',
    wrongAnswer3: 'من فضلك',
    coinsReward: 10
  },
  {
    word: 'Yes',
    description: 'Thumbs up gesture meaning yes or approval',
    difficulty: 'easy',
    animationData: null,
    correctAnswer: 'نعم',
    wrongAnswer1: 'لا',
    wrongAnswer2: 'ربما',
    wrongAnswer3: 'آسف',
    coinsReward: 10
  },
  {
    word: 'Peace',
    description: 'Peace sign with two fingers',
    difficulty: 'medium',
    animationData: null,
    correctAnswer: 'سلام',
    wrongAnswer1: 'نصر',
    wrongAnswer2: 'اثنان',
    wrongAnswer3: 'حب',
    coinsReward: 15
  },
  {
    word: 'Thank You',
    description: 'Gesture of gratitude',
    difficulty: 'medium',
    animationData: null,
    correctAnswer: 'شكرا',
    wrongAnswer1: 'من فضلك',
    wrongAnswer2: 'آسف',
    wrongAnswer3: 'عفوا',
    coinsReward: 15
  },
  {
    word: 'I Love You',
    description: 'Combined I-L-Y sign',
    difficulty: 'hard',
    animationData: null,
    correctAnswer: 'أحبك',
    wrongAnswer1: 'أعجبني',
    wrongAnswer2: 'اشتقت لك',
    wrongAnswer3: 'أحتاجك',
    coinsReward: 20
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Sign.deleteMany({});
    await UserProgress.deleteMany({});
    console.log('✓ Cleared existing signs and progress');

    // Generate animations
    console.log('\n🎨 Generating sample animations...');
    const animations = {
      hello: generateWaveAnimation(),
      yes: generateThumbsUpAnimation(),
      peace: generatePeaceSignAnimation()
    };
    console.log('✓ Generated animations');

    // Assign animations to signs
    sampleSigns[0].animationData = animations.hello;
    sampleSigns[1].animationData = animations.yes;
    sampleSigns[2].animationData = animations.peace;
    sampleSigns[3].animationData = animations.hello; // Reusing for demo
    sampleSigns[4].animationData = animations.peace; // Reusing for demo

    // Add duration from animation data
    sampleSigns.forEach(sign => {
      sign.duration = sign.animationData.duration;
    });

    // Create signs
    console.log('\n📝 Creating signs...');
    let createdCount = 0;
    for (const signData of sampleSigns) {
      const sign = await Sign.create(signData);
      createdCount++;
      console.log(`✓ Created sign: ${sign.word} (${sign.difficulty})`);
    }
    console.log(`\n✅ Successfully created ${createdCount} signs!`);

    // Create demo user progress
    console.log('\n👤 Creating demo user...');
    const demoProgress = await UserProgress.create({
      username: 'demo_user',
      totalCoins: 100,
      signsLearned: [],
      currentStreak: 0,
      bestStreak: 0
    });
    console.log('✓ Created demo user progress');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Signs created: ${createdCount}`);
    console.log(`   Demo user: ${demoProgress.username}`);
    console.log(`   Initial coins: ${demoProgress.totalCoins}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run seed function
seedDatabase();
