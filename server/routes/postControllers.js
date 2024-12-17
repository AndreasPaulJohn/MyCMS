const { Post, User, Category, Media } = require("../models");
const {
  sanitizeHtml,
  generateUniqueSlug,
} = require("./postHelpers");
const { validateCategoryIds } = require("./postValidation");
const { 
  optimizeImage, 
  formatCKEditorResponse 
} = require('../middleware/imageProcessing');
const fs = require('fs').promises; 
const { Op } = require('sequelize');


exports.getPosts = async (req, res) => {
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
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getPostById = async (req, res) => {
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
  };


exports.createPost = async (req, res) => {
  try {
    const { title, content, categoryIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    const existingPost = await Post.findOne({ where: { title } });
    if (existingPost) {
      return res.status(400).json({ message: "Ein Beitrag mit diesem Titel existiert bereits." });
    }

    // Create the post
    const post = await Post.create({
      title,
      content,
      author_id: req.user.id,
    });

    console.log("Post created:", post.toJSON());

    // Assign categories if present
    if (categoryIds && categoryIds.length > 0) {
      await post.setCategories(categoryIds);
      console.log("Categories assigned to post:", categoryIds);
    }

    // Process images
    const imageUrls = extractImageUrls(content);
    console.log("Extracted image URLs:", imageUrls);

    for (let url of imageUrls) {
      const cleanUrl = url.replace(/^\//, '');
      console.log("Processing image URL:", cleanUrl);

      try {
        let media = await Media.findOne({ where: { file_path: cleanUrl } });
        
        if (!media) {
          console.log("Media not found, creating new entry");
          media = await Media.create({
            file_name: cleanUrl.split('/').pop(),
            file_path: cleanUrl,
            file_type: 'image',
            uploaded_by: req.user.id,
            uploaded_at: new Date(),
          });
          console.log("New media created:", media.toJSON());
        } else {
          console.log("Existing media found:", media.toJSON());
        }
        
        await post.addMedia(media);
        console.log("Media associated with post");
      } catch (mediaError) {
        console.error("Error processing media:", mediaError);
        // Continue with the next image even if there's an error with one
      }
    }

    // Fetch the created post with all relations
    const createdPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "username"] },
        { model: Category, as: "Categories", attributes: ["id", "name"] },
        { model: Media, as: "Media", attributes: ["id", "file_path"] },
      ],
    });

    console.log("Final created post:", createdPost.toJSON());

    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};
  
// Extrahiere Bild-URLs aus dem HTML-Inhalt
function extractImageUrls(content) {
  const regex = /<img[^>]+src="?([^"\s]+)"?\s*/gi;
  const urls = [];
  let match;
  while ((match = regex.exec(content))) {
    let url = match[1];
    if (!url.startsWith('/server/uploads/')) {
      url = `/server/uploads/${url.split('/').pop()}`;
    }
    urls.push(url);
  }
  return urls;
}
 
  

exports.updatePost = async (req, res) => {
  try {
    const { title, content, categoryIds, removeImage } = req.body;

    // Hole den Post, der aktualisiert werden soll
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: Media, as: "Media" }]
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Überprüfen, ob der Benutzer berechtigt ist, den Beitrag zu aktualisieren
    if (post.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Aktualisiere den Post-Inhalt und den Titel
    await post.update({
      title,
      content,
    });

    // Extrahiere die Bild-URLs aus dem aktualisierten Content
    const imageUrls = extractImageUrls(content);

    // Alte Bilder entfernen, wenn erforderlich
    if (removeImage === 'true') {
      await post.setMedia([]);
    }

    // Neue Bilder mit dem Post verknüpfen
    for (let url of imageUrls) {
      const cleanUrl = url.replace(/^\//, '');
      let media = await Media.findOne({ where: { file_path: cleanUrl } });
      
      if (!media) {
        // If media doesn't exist, create it
        media = await Media.create({
          file_name: cleanUrl.split('/').pop(),
          file_path: cleanUrl,
          file_type: 'image', // You might want to determine this dynamically
          uploaded_by: req.user.id,
          uploaded_at: new Date(),
        });
      }
      
      await post.addMedia(media);
    }

    // Kategorien aktualisieren, falls vorhanden
    if (categoryIds && categoryIds.length > 0) {
      await post.setCategories(categoryIds);
    }

    // Lade den Post mit allen Beziehungen
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "username"] },
        { model: Category, as: "Categories", attributes: ["id", "name"] },
        { model: Media, as: "Media", attributes: ["id", "file_path"] },
      ],
    });

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};
  

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author_id !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }
    await post.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error in deletePost:", error);
    res
      .status(400)
      .json({ message: "Failed to delete post", error: error.message });
  }
};



 
exports.uploadImage = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);

    let file = req.file;
    if (!file && req.files) {
      file = req.files.upload;  // CKEditor sendet das Bild unter dem Namen 'upload'
    }

    if (!file) {
      return res.status(400).json({ 
        uploaded: 0,
        error: { message: 'No file uploaded' }
      });
    }

    const processedImage = await optimizeImage(file);
    const media = await Media.create({
      file_name: processedImage.filename,
      file_path: `/server/uploads/${processedImage.filename}`,
      file_type: file.mimetype,
      uploaded_by: req.user.id,
      uploaded_at: new Date(),
    });
    
    // Format the response for CKEditor
    res.json({
      uploaded: 1,
      fileName: processedImage.filename,
      url: `/server/uploads/${processedImage.filename}`
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      uploaded: 0,
      error: {
        message: 'Error processing image: ' + error.message
      }
    });
  }
};



exports.addImageToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const media = await Media.findOne({ where: { file_path: imageUrl.replace(/^\//, '') } });
    if (media) {
      await post.addMedia(media);
    }
    res.status(200).json({ message: 'Image added successfully' });
  } catch (error) {
    console.error('Error adding image to post:', error);
    res.status(500).json({ message: 'Error adding image to post', error: error.message });
  }
};





exports.deletePostImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const media = await Media.findOne({ where: { file_path: imageUrl.replace(/^\//, '') } });
    if (media) {
      await post.removeMedia(media);
    }
    res.status(200).json({ message: 'Image removed successfully' });
  } catch (error) {
    console.error('Error removing image from post:', error);
    res.status(500).json({ message: 'Error removing image from post', error: error.message });
  }
};


exports.searchPosts = async (req, res) => {
    try {
      console.log('Received search request:', req.query);
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
  
      console.log('Search where clause:', JSON.stringify(whereClause, null, 2));
  
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
  
      console.log(`Found ${posts.length} posts`);
      res.json(posts);
    } catch (error) {
      console.error("Error in searchPosts:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };