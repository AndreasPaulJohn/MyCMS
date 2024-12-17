// routes/categories.js
const express = require('express');
const router = express.Router();
const db = require('../models'); // Import the db object that contains all models
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const slugify = require('slugify');

// Fetch all categories
router.get('/',  async (req, res) => {
  try {
    const categories = await db.Category.findAll();
    console.log('Categories fetched:', categories);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Create a category (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const category = await db.Category.create({ name, slug, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a category (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a category (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const updatedCategory = await category.update({
      name: name || category.name,
      slug: name ? slugify(name, { lower: true, strict: true }) : category.slug,
      description: description || category.description
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
;


