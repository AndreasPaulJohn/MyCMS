module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    file_name: DataTypes.STRING,
    file_path: DataTypes.STRING,
    file_type: DataTypes.STRING,
    uploaded_by: DataTypes.INTEGER,
    uploaded_at: DataTypes.DATE
  }, {
    tableName: 'media'
  });

  Media.associate = function(models) {
    Media.belongsTo(models.User, { foreignKey: 'uploaded_by' });
    Media.belongsToMany(models.Post, { through: 'PostMedia', as: 'Posts',  foreignKey: 'mediaId' });
  };

  return Media;
};
