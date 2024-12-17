const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const { Post } = require('../models');
const { Op } = require('sequelize');
const { optimizeImage } = require('../middleware/imageProcessing');

exports.generateUniqueSlug = async (title, id = null) => {
  let slug = slugify(title, { lower: true, strict: true });
  let counter = 1;
  let uniqueSlug = slug;
  let existingPost;
  
  do {
    if (id) {
      existingPost = await Post.findOne({ where: { slug: uniqueSlug, id: { [Op.ne]: id } } });
    } else {
      existingPost = await Post.findOne({ where: { slug: uniqueSlug } });
    }
    
    if (existingPost) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  } while (existingPost);

  return uniqueSlug;
};

exports.sanitizeHtml = (content) => {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt']
    }
  });
};

 
