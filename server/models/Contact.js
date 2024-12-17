// models/Contact.js
module.exports = (sequelize, DataTypes) => {
    const Contact = sequelize.define('Contact', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      tableName: 'contacts',
      timestamps: true,
      underscored: true
    });
  
    return Contact;
  };