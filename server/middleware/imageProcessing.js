const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { MAX_FILE_SIZE, MAX_WIDTH, MAX_HEIGHT, IMAGE_QUALITY } = require('../routes/config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

exports.uploadMiddleware = multer({ 
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_, file, cb) => {
    console.log('File received:', file);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilder sind erlaubt!'), false);
    }
  }
}).single('image');

exports.optimizeImage = async (file) => {
  const originalFilename = path.parse(file.filename).name;
  const optimizedFilename = `optimized-${originalFilename}.png`;
  const outputPath = path.join('server/uploads', optimizedFilename);
  
  try {
    console.log('Optimizing image:', file.path);
    await sharp(file.path)
      .resize(MAX_WIDTH, MAX_HEIGHT, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .png({ quality: IMAGE_QUALITY })
      .ensureAlpha()
      .toFile(outputPath);
    
    console.log('Image optimized successfully:', outputPath);
    return {
      filename: optimizedFilename,
      path: outputPath,
      mimetype: 'image/png'
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    return {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype
    };
  }
};

exports.formatCKEditorResponse = (file) => {
  return {
    url: `/server/uploads/${file.filename}`,
    alt: file.originalname,
    uploaded: 1
  };
};
