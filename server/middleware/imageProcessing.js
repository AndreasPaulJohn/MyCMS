const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

// Konfigurationswerte bleiben gleich
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_WIDTH = 2560;
const MAX_HEIGHT = 1440;
const IMAGE_QUALITY = 90;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Verbesserte Pfadkonstanten
const UPLOAD_DIR = 'uploads';
const UPLOAD_URL_PREFIX = '/uploads';

// ensureUploadDir Funktion bleibt gleich
const ensureUploadDir = async () => {
  const uploadDir = path.resolve(UPLOAD_DIR);
  try {
    await fs.access(uploadDir);
  } catch {
    console.log('Creating uploads directory:', uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Storage Konfiguration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = await ensureUploadDir();
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error with upload directory:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'optimized-image-' + uniqueSuffix + ext);
  }
});

// FileFilter bleibt gleich
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Nicht unterstütztes Dateiformat. Erlaubt sind nur: ${ALLOWED_TYPES.join(', ')}`));
  }
};

// Multer Middleware
exports.uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).single('image');

// Optimierung und Logging
exports.optimizeImage = async (file) => {
  if (!file) throw new Error('Keine Datei zum Optimieren gefunden');

  console.log('Starting image optimization:', {
    originalPath: file.path,
    size: file.size,
    mimetype: file.mimetype
  });

  try {
    const imageInfo = await sharp(file.path).metadata();
    console.log('Original image info:', imageInfo);

    const pipeline = sharp(file.path)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png({ quality: IMAGE_QUALITY })
      .ensureAlpha();

    const optimizedPath = file.path + '.opt';
    await pipeline.toFile(optimizedPath);

    await fs.unlink(file.path);
    await fs.rename(optimizedPath, file.path);

    const processedInfo = await sharp(file.path).metadata();

    const filename = path.basename(file.path);
    const dbPath = path.join(UPLOAD_DIR, filename);
    const urlPath = path.join(UPLOAD_URL_PREFIX, filename);

    console.log('Image optimization complete:', {
      filename,
      dbPath,
      urlPath,
      originalSize: imageInfo.size,
      processedSize: processedInfo.size,
      dimensions: `${processedInfo.width}x${processedInfo.height}`
    });

    return {
      filename,
      path: dbPath,
      url: urlPath,
      width: processedInfo.width,
      height: processedInfo.height,
      mimetype: 'image/png'
    };
  } catch (error) {
    console.error('Image optimization failed:', {
      error: error.message,
      file: file.path,
      stack: error.stack
    });
    throw error;
  }
};

// CKEditor Response mit konsistenten URLs
exports.formatCKEditorResponse = (file) => {
  const filename = file.filename || path.basename(file.path);
  const url = file.url || path.join(UPLOAD_URL_PREFIX, filename);

  return {
    url,
    uploaded: 1,
    fileName: filename,
    width: file.width,
    height: file.height
  };
};
