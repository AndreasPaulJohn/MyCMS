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
app.use(cors());
app.use(express.json());
app.use(helmet());

// Custom middleware for handling image requests
app.use('/uploads', (req, res, next) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif)$/)) {
    res.set('Content-Type', `image/${req.url.split('.').pop()}`);
    console.log('Image request:', req.url);
  }
  next();
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Import routes
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const commentRoutes = require("./routes/comments");
const contactRoutes = require("./routes/contact");
const captchaRoutes = require("./routes/captcha");

// Use routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/captcha", captchaRoutes);

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
    app.listen(PORT, () => {
      logger.access(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Database connection failed: ${err}`);
    console.error('Database connection failed:', err);
  });


