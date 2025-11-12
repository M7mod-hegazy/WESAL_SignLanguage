const express = require('express');
const router = express.Router();
const {
  createSharedPost,
  getSharedPosts,
  getUserSharedPosts,
  likeSharedPost,
  unlikeSharedPost,
  saveSharedPost,
  unsaveSharedPost,
  deleteSharedPost
} = require('../controllers/sharedPostController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/', verifyToken, createSharedPost);
router.get('/', verifyToken, getSharedPosts);
router.get('/user/:firebaseUid', verifyToken, getUserSharedPosts);
router.post('/:id/like', verifyToken, likeSharedPost);
router.post('/:id/unlike', verifyToken, unlikeSharedPost);
router.post('/:id/save', verifyToken, saveSharedPost);
router.post('/:id/unsave', verifyToken, unsaveSharedPost);
router.delete('/:id', verifyToken, deleteSharedPost);

module.exports = router;
