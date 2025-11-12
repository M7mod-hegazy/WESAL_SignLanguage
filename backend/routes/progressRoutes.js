const express = require('express');
const router = express.Router();
const {
  getAllProgress,
  getMyProgress,
  getProgressByUsername,
  addCoins,
  incrementStreak,
  resetStreak,
  addLearnedSign,
  createProgress
} = require('../controllers/progressController');

// Special routes (must come before /:username)
router.get('/my_progress', getMyProgress);
router.post('/add_coins', addCoins);
router.post('/increment_streak', incrementStreak);
router.post('/reset_streak', resetStreak);
router.post('/add_learned_sign', addLearnedSign);

// CRUD routes
router.route('/')
  .get(getAllProgress)
  .post(createProgress);

router.get('/:username', getProgressByUsername);

module.exports = router;
