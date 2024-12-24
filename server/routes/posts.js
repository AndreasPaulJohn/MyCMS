const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const { authenticateToken } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/imageProcessing');
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  uploadImage,
  addImageToPost,
  deletePostImage
} = require('./postControllers');

// Existierende Routen
router.get('/search', searchPosts);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticateToken, uploadMiddleware, createPost);
router.put('/:id', authenticateToken, uploadMiddleware, updatePost);
router.delete('/:id', authenticateToken, deletePost);

// Bild-Routen
router.post('/upload', authenticateToken, uploadMiddleware, uploadImage);
router.post('/:id/images', authenticateToken, addImageToPost);
router.delete('/:id/images', authenticateToken, deletePostImage);

module.exports = router;