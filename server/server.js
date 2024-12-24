require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require('helmet');
const fs = require('fs');

// Debug und Logging Setup
console.log("\n=== Environment ===");
console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);

// Import models
const db = require('./models');

// Logging-Funktion
const setupLogging = () => {
  const logDir = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const accessLogPath = path.join(logDir, 'access.log');
  const errorLogPath = path.join(logDir, 'error.log');

  const accessStream = fs.createWriteStream(accessLogPath, { flags: 'a' });

  return {
    access: (message) => {
      const timestamp = new Date().toISOString();
      accessStream.write(`${timestamp} - ${message}\n`);
    },
    error: (message) => {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(errorLogPath, `${timestamp} - ${message}\n`);
    }
  };
};

const logger = setupLogging();
const app = express();

// Request Logging
app.use((req, res, next) => {
  const message = `${req.method} ${req.url}`;
  logger.access(message);
  next();
});

// Middleware
app.use(cors({
  origin: [
    'https://www.cms.codeclover.de',
    'https://cms.codeclover.de',
    'http://localhost:3000',
    'http://localhost:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://www.cms.codeclover.de"],
      imgSrc: ["'self'", "data:", "blob:", "https://www.cms.codeclover.de"],
      mediaSrc: ["'self'", "data:", "blob:", "https://www.cms.codeclover.de"],
      connectSrc: ["'self'", "https://www.cms.codeclover.de"]
    },
  },
}));

// API Routes
app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/captcha", require("./routes/captcha"));

// Absoluter Pfad zum Upload-Verzeichnis
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const UPLOADS_URL = '/api/media';
const LEGACY_UPLOADS_URL = '/uploads';

// Überprüfen, ob das Verzeichnis existiert
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('Created uploads directory:', UPLOADS_DIR);
}

const setImageHeaders = (res, filePath) => {
  if (filePath.match(/\.(jpg|jpeg|png|gif)$/)) {
    const contentType = `image/${path.extname(filePath).slice(1)}`;
    const relativeFilePath = path.relative(UPLOADS_DIR, filePath);
    const fullUrl = `${UPLOADS_URL}/${relativeFilePath}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 Jahr Cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    console.log('Serving image:', {
      path: filePath,
      url: fullUrl,
      contentType: contentType
    });
  }
};

// Serve files under both /api/media and /uploads
app.use(UPLOADS_URL, express.static(UPLOADS_DIR, {
  setHeaders: setImageHeaders
}));

app.use(LEGACY_UPLOADS_URL, express.static(UPLOADS_DIR, {
  setHeaders: setImageHeaders
}));

// Debug-Route zum Testen der Uploads-Konfiguration
app.get('/debug/uploads', (req, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      uploadsDir: UPLOADS_DIR,
      uploadsUrl: UPLOADS_URL,
      files: files
    });
  });
});

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  // Static files
  app.use(express.static(path.join(__dirname, 'build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.url.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

// Start server and database connection
db.sequelize.authenticate()
  .then(() => {
    logger.access('Database connection established');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    logger.access('Database synced');
    app.listen(PORT, '0.0.0.0', () => { // Bind to all interfaces
      logger.access(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err}`);
    console.error('Database connection failed:', err);
  });
