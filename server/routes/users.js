const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, roleCheck } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { sendRegistrationEmail } = require('../utils/emailService');
const axios = require('axios');
const config = require('../config'); // Konfigurationsdatei für API-URLs und JWT-Secret

// Am Anfang der users.js nach den Imports
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

console.log('Environment check:', {
  JWT_SECRET_SET: !!process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: config.API_BASE_URL
});
// Token-Verifizierung
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ isValid: true, user: req.user });
});

// Benutzerliste (nur Admins)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role']
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Registrierung
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, captchaId, captchaAnswer } = req.body;

    // Captcha-Validierung
    const captchaResponse = await axios.post(`${config.API_BASE_URL}/captcha/verify`, {
      id: captchaId,
      answer: captchaAnswer
    });

    if (!captchaResponse.data.valid) {
      return res.status(400).json({ message: 'Invalid captcha' });
    }

    // Benutzer erstellen
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password_hash, active: false });
    await sendRegistrationEmail(email, username);

    res.status(201).json({
      message: 'User registered successfully. Account pending activation.',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Your account is not activated yet. Please wait for admin approval.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Debug-Ausgabe hinzufügen
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'is set' : 'is not set');

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h' 
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Admin erstellt Benutzer
router.post('/admin', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password_hash, role: 'admin' });
    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const newToken = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(400).json({ message: 'Invalid token' });
  }
});

// Benutzer aktualisieren (nur Admins)
router.put('/:id', authenticateToken, roleCheck(['admin']), async (req, res) => {
  try {
    const { role, can_upload_images } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ role, can_upload_images });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Benutzer löschen (nur Admins)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await User.destroy({ where: { id: req.params.id } });
    if (!result) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
