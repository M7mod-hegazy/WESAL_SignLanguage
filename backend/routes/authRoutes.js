const express = require('express');
const router = express.Router();
const {
  verifyFirebaseUser,
  getCurrentUser,
  updateProfile,
  updateGender,
  deleteAccount,
  getUserStats,
  updateCoins,
  addCoins,
  subtractCoins,
  incrementChallenges,
  likeStory,
  unlikeStory
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/verify', verifyFirebaseUser);

// Protected routes (require authentication)
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/update-gender', verifyToken, updateGender);
router.delete('/account', verifyToken, deleteAccount);
router.get('/stats', verifyToken, getUserStats);

// Coins management routes
router.post('/update-coins', verifyToken, updateCoins);
router.post('/add-coins', verifyToken, addCoins);
router.post('/subtract-coins', verifyToken, subtractCoins);

// Challenges and story likes routes
console.log('🔧 Registering /increment-challenges route...');

// Add middleware to log ALL requests to this router
router.use((req, res, next) => {
  console.log(`🔍 Auth route hit: ${req.method} ${req.path}`);
  next();
});

// TEST ROUTE - No auth required
router.post('/test-increment', async (req, res) => {
  console.log('✅ TEST ROUTE HIT!');
  res.json({ success: true, message: 'Test route works!' });
});

router.post('/increment-challenges', verifyToken, incrementChallenges);
console.log('🔧 Registering /like-story route...');
router.post('/like-story', verifyToken, likeStory);
console.log('🔧 Registering /unlike-story route...');
router.post('/unlike-story', verifyToken, unlikeStory);

// Debug: Log registered routes
console.log('✅ Auth routes registered:', {
  incrementChallenges: typeof incrementChallenges,
  likeStory: typeof likeStory,
  unlikeStory: typeof unlikeStory
});

module.exports = router;
