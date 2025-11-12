const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  createPost,
  toggleLike,
  addComment,
  toggleSave,
  sharePost,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { verifyToken, optionalAuth } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Public routes - with caching for better performance
router.get('/', optionalAuth, cacheMiddleware, getAllPosts);

// Protected routes
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.post('/:id/like', verifyToken, toggleLike);
router.post('/:id/comment', verifyToken, addComment);
router.post('/:id/save', verifyToken, toggleSave);
router.post('/:id/share', verifyToken, sharePost);
router.delete('/:id', verifyToken, deletePost);

module.exports = router;
