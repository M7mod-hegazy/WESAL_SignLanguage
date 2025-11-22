const express = require('express');
const router = express.Router();
const {
  getAllStories,
  createStory,
  viewStory,
  deleteStory
} = require('../controllers/storyController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const { handleFileUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', optionalAuth, getAllStories);

// Protected routes
router.post('/', verifyToken, handleFileUpload, createStory);
router.post('/:id/view', verifyToken, viewStory);
router.delete('/:id', verifyToken, deleteStory);

module.exports = router;
