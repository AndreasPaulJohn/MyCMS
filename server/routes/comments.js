// routes/comments.js

const express = require('express');
const router = express.Router(); // Router initialisieren
const db = require('../models');
const { Comment, User, Post } = db;
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
console.log('Available models:', Object.keys(db));
// Create a new comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, post_id } = req.body;
    const comment = await Comment.create({
      content,
      post_id,
      user_id: req.user.id,
      status: 'pending'
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    console.log('Attempting to fetch comments for post:', req.params.postId);
    const comments = await Comment.findAll({
      where: { post_id: req.params.postId },
      include: [{ model: User, attributes: ['username'] }],
      order: [['created_at', 'DESC']]
    });
    console.log(`Successfully fetched ${comments.length} comments`);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message, stack: error.stack });
  }
});


// Update a comment (only for comment owner or admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }
    const updatedComment = await comment.update({
      content: req.body.content || comment.content,
      status: req.user.role === 'admin' ? (req.body.status || comment.status) : comment.status
    });
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Moderate a comment
router.patch('/:id/moderate', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.status = status;
    await comment.save();

    res.json({ message: 'Comment status updated successfully', comment });
  } catch (error) {
    console.error('Error moderating comment:', error);
    res.status(500).json({ message: 'Error moderating comment' });
  }
});

// Delete a comment (only for comment owner or admin)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const commentId = req.params.id;
    await Comment.destroy({ where: { id: commentId } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
