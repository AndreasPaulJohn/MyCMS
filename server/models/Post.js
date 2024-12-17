const slugify = require('slugify');

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    published_at: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
   
    media_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Posts',  // Geändert zu 'Posts' mit Großbuchstaben
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (post) => {
        if (post.title) {
          post.slug = slugify(post.title, { lower: true, strict: true });
        }
      }
    },
    scopes: {
      searchByTitle(query) {
        return {
          where: {
            title: {
              [DataTypes.Op.iLike]: `%${query}%`
            }
          }
        };
      },
      searchByContent(query) {
        return {
          where: {
            content: {
              [DataTypes.Op.iLike]: `%${query}%`
            }
          }
        };
      }
    }
  });

  Post.associate = function(models) {
    Post.belongsTo(models.User, { foreignKey: 'author_id', as: 'User' });
    Post.belongsToMany(models.Category, { through: 'PostCategories' });
    Post.belongsToMany(models.Media, { through: 'PostMedia', as: 'Media', foreignKey: 'postId' });
  };

  return Post;
};