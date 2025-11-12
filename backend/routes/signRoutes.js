const express = require('express');
const router = express.Router();
const {
  getAllSigns,
  getSignById,
  getRandomQuiz,
  getSequentialQuiz,
  checkAnswer,
  getSignsByDifficulty,
  createSign,
  updateSign,
  deleteSign
} = require('../controllers/signController');

// Special routes (must come before /:id)
router.get('/random_quiz', getRandomQuiz);
router.get('/sequential_quiz/:category', getSequentialQuiz);
router.get('/by_difficulty', getSignsByDifficulty);

// CRUD routes
router.route('/')
  .get(getAllSigns)
  .post(createSign);

router.route('/:id')
  .get(getSignById)
  .put(updateSign)
  .delete(deleteSign);

// Check answer route
router.post('/:id/check_answer', checkAnswer);

module.exports = router;
