require('dotenv').config();
const User = require('../models/User');
const sequelize = require('../config/db');

async function updateAdminPermissions() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (adminUser) {
      await adminUser.update({ can_upload_images: true });
      console.log('Admin user updated successfully');
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

updateAdminPermissions();