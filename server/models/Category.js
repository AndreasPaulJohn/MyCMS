// models/Category.js
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });

  Category.associate = function(models) {
    Category.belongsToMany(models.Post, { through: 'PostCategories' });
  };

  return Category;
};


