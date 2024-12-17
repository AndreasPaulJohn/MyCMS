const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const { authenticateToken } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/imageProcessing');
const { Post, Media } = require('../models');
const {
  addImageToPost,
  searchPosts,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  deletePostImage,
  uploadImage
} = require('./postControllers');

// Existierende Routen
router.get('/search', searchPosts);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', authenticateToken, uploadMiddleware, createPost);
router.put('/:id', authenticateToken, uploadMiddleware, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.delete('/:id/image', authenticateToken, deletePostImage);
router.post('/upload', authenticateToken, uploadMiddleware, uploadImage);
router.post('/:id/images', authenticateToken, addImageToPost);

module.exports = router;
