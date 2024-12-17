module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'editor'),
      allowNull: false,
      defaultValue: 'user'
    },
    can_upload_images: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = function(models) {
    User.hasMany(models.Post, { foreignKey: 'author_id' });
    // Fügen Sie hier weitere Assoziationen hinzu, falls vorhanden
  };

  return User;
};





// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const User = sequelize.define('User', {
//   username: {
//     type: DataTypes.STRING(50),
//     allowNull: false,
//     unique: true,
//   },
//   role: {
//     type: DataTypes.ENUM('user', 'admin', 'editor', 'author'),
//     allowNull: false,
//     defaultValue: 'user'
//   },
//   can_upload_images: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false
//   },
//   email: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//     unique: true
//   },
//   password_hash: {
//     type: DataTypes.STRING(255),
//     allowNull: false
//   },
//   role: {
//     type: DataTypes.ENUM('user', 'admin', 'editor'),
//     allowNull: false,
//     defaultValue: 'user'
//   }
// }, {
//   tableName: 'users',
//   createdAt: 'created_at',
//   updatedAt: 'updated_at'
// });

// User.associate = function(models) {
//   User.hasMany(models.Post, { foreignKey: 'author_id' });
// };

// module.exports = User;