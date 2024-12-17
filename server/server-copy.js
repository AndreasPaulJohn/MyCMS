require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require('helmet');
const fs = require('fs');
const morgan = require('morgan');

// Import models
const db = require('./models');
const app = express();

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(helmet());

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
  fs.appendFileSync(path.join(__dirname, 'error.log'), `${new Date().toISOString()} - ${err.stack}\n`);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

// Log available models
console.log('Available models:', Object.keys(db));

// Attempt to authenticate database connection
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    // Sync database with logging
    return db.sequelize.sync({ alter: true, logging: console.log });
  })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
    fs.appendFileSync(path.join(__dirname, 'error.log'), `${new Date().toISOString()} - Failed to sync database: ${err}\n`);
  });
