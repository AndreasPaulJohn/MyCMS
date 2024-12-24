const { Post, User, Category, Media } = require("../models");
const { optimizeImage } = require('../middleware/imageProcessing');
const { Op } = require('sequelize');

const postController = {
  // Get all posts with pagination
  getPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Post.findAndCountAll({
        include: [
          { model: User, as: "User", attributes: ["id", "username"] },
          {
            model: Category,
            as: "Categories",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
          {
            model: Media,
            as: "Media",
            attributes: ["id", "file_path"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: limit,
        offset: offset,
      });

      console.log("Posts fetched:", JSON.stringify(rows, null, 2));

      res.json({
        totalItems: count,
        posts: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error("Error in getPosts:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },

  // Get single post by ID
  getPostById: async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await Post.findByPk(postId, {
        include: [
          { model: User, as: "User", attributes: ["id", "username"] },
          {
            model: Category,
            as: "Categories",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
          { model: Media, as: "Media", attributes: ["id", "file_path"] },
        ],
      });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error in getPostById:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },

  // Create new post
  createPost: async (req, res) => {
    try {
      const { title, content, categoryIds } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required." });
      }

      const post = await Post.create({
        title,
        content,
        author_id: req.user.id,
      });

      if (categoryIds && categoryIds.length > 0) {
        await post.setCategories(categoryIds);
      }

      const imageUrls = extractImageUrls(content);
      for (let url of imageUrls) {
        const cleanUrl = url.replace(/^\.\.\//, '').replace(/^\//, '');
        let media = await Media.findOne({ where: { file_path: cleanUrl } });
        
        if (!media) {
          media = await Media.create({
            file_name: cleanUrl.split('/').pop(),
            file_path: cleanUrl,
            file_type: 'image',
            uploaded_by: req.user.id,
            uploaded_at: new Date(),
          });
        }
        
        await post.addMedia(media);
      }

      const createdPost = await Post.findByPk(post.id, {
        include: [
          { model: User, as: "User", attributes: ["id", "username"] },
          { model: Category, as: "Categories", attributes: ["id", "name"] },
          { model: Media, as: "Media", attributes: ["id", "file_path"] },
        ],
      });

      res.status(201).json(createdPost);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: 'Error creating post', error: error.message });
    }
  },

  // Update existing post
  updatePost: async (req, res) => {
    try {
      const { title, content, categoryIds, removeImage } = req.body;
      const post = await Post.findByPk(req.params.id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.author_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }

      await post.update({ title, content });

      if (categoryIds && categoryIds.length > 0) {
        await post.setCategories(categoryIds);
      }

      const imageUrls = extractImageUrls(content);
      if (removeImage === 'true') {
        await post.setMedia([]);
      }

      for (let url of imageUrls) {
        const cleanUrl = url.replace(/^\.\.\//, '').replace(/^\//, '');
        let media = await Media.findOne({ where: { file_path: cleanUrl } });
        
        if (!media) {
          media = await Media.create({
            file_name: cleanUrl.split('/').pop(),
            file_path: cleanUrl,
            file_type: 'image',
            uploaded_by: req.user.id,
            uploaded_at: new Date(),
          });
        }
        
        await post.addMedia(media);
      }

      const updatedPost = await Post.findByPk(post.id, {
        include: [
          { model: User, as: "User", attributes: ["id", "username"] },
          { model: Category, as: "Categories", attributes: ["id", "name"] },
          { model: Media, as: "Media", attributes: ["id", "file_path"] },
        ],
      });

      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Error updating post', error: error.message });
    }
  },

  // Delete post
  deletePost: async (req, res) => {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      if (post.author_id !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
      await post.destroy();
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Error deleting post", error: error.message });
    }
  },

  // Search posts
  searchPosts: async (req, res) => {
    try {
      const { query, category, dateFrom, dateTo } = req.query;
      let whereClause = {};

      if (query) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { content: { [Op.iLike]: `%${query}%` } }
        ];
      }

      if (category) {
        whereClause['$Categories.id$'] = category;
      }

      if (dateFrom) {
        whereClause.createdAt = whereClause.createdAt || {};
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }

      if (dateTo) {
        whereClause.createdAt = whereClause.createdAt || {};
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }

      const posts = await Post.findAll({
        where: whereClause,
        include: [
          { model: User, as: "User", attributes: ["id", "username"] },
          {
            model: Category,
            as: "Categories",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
          { model: Media, as: "Media", attributes: ["id", "file_path"] },
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(posts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Error searching posts", error: error.message });
    }
  },

  // Upload image
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          uploaded: 0,
          error: { message: 'No file uploaded' }
        });
      }

      const processedImage = await optimizeImage(req.file);
      const media = await Media.create({
        file_name: processedImage.filename,
        file_path: processedImage.relativeFilePath,
        file_type: req.file.mimetype,
        uploaded_by: req.user.id,
        uploaded_at: new Date()
      });

      res.json({
        uploaded: 1,
        fileName: processedImage.filename,
        url: `/uploads/${processedImage.filename}` // Direkter Pfad zum Bild
    });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ 
        uploaded: 0,
        error: {
          message: error.message || 'Error uploading image'
        }
      });
    }
  },

  // Add image to post
  addImageToPost: async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      const post = await Post.findByPk(id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const cleanUrl = imageUrl.replace(/^\.\.\//, '').replace(/^\//, '');
      const media = await Media.findOne({ where: { file_path: cleanUrl } });
      
      if (media) {
        await post.addMedia(media);
      }
      
      res.json({ message: 'Image added successfully' });
    } catch (error) {
      console.error('Error adding image:', error);
      res.status(500).json({ message: 'Error adding image', error: error.message });
    }
  },

  // Delete image from post
  deletePostImage: async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      const post = await Post.findByPk(id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const cleanUrl = imageUrl.replace(/^\.\.\//, '').replace(/^\//, '');
      const media = await Media.findOne({ where: { file_path: cleanUrl } });
      
      if (media) {
        await post.removeMedia(media);
      }
      
      res.json({ message: 'Image removed successfully' });
    } catch (error) {
      console.error('Error removing image:', error);
      res.status(500).json({ message: 'Error removing image', error: error.message });
    }
  }
};

// Helper function to extract image URLs from content
function extractImageUrls(content) {
  const regex = /<img[^>]+src="?([^"\s]+)"?\s*/gi;
  const urls = [];
  let match;
  
  while ((match = regex.exec(content))) {
    let url = match[1];
    url = url.replace(/\.\.\//, '').replace(/^\//, '');
    urls.push(url);
  }
  
  return urls;
}

module.exports = postController;