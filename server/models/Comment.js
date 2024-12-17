// models/Comment.js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('approved', 'pending', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true
  });

  Comment.associate = function(models) {
    Comment.belongsTo(models.User, { foreignKey: 'user_id' });
    Comment.belongsTo(models.Post, { foreignKey: 'post_id' });
  };

  return Comment;
};