const { sequelize, User, Post, Category, Media, Comment } = require('./models');

async function cleanupDatabase() {
  try {
    await sequelize.transaction(async (t) => {
      // Lösche alle Kommentare
      await Comment.destroy({ where: {}, transaction: t });

      // Lösche alle Posts
      await Post.destroy({ where: {}, transaction: t });

      // Lösche alle Medien
      await Media.destroy({ where: {}, transaction: t });

      // Lösche alle Kategorien
      await Category.destroy({ where: {}, transaction: t });

      // Lösche alle Benutzer außer den Admin
      await User.destroy({ 
        where: { 
          role: { [sequelize.Op.ne]: 'admin' } 
        }, 
        transaction: t 
      });
    });

    console.log('Datenbank erfolgreich bereinigt.');
  } catch (error) {
    console.error('Fehler bei der Datenbankbereinigung:', error);
  } finally {
    await sequelize.close();
  }
}

cleanupDatabase();