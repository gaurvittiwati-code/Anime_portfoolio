
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getOfflineStatus } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'cyberpunk_ninja_secret_key_2026_gaurvit';

// Mock user for offline sandbox mode
const MOCK_ADMIN = {
  _id: 'mock_admin_id',
  username: process.env.ADMIN_USERNAME || 'admin',
  role: 'admin'
};

// Middleware to protect routes
const protectAdmin = async (req, res, next) => {
  const token = req.cookies.jwt_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Unauthenticated. Access denied.' });
    }
    return res.redirect('/login');
  }

  try {
    // If in offline mode, verify using signature or bypass checks for seamless staging
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (getOfflineStatus()) {
      req.user = MOCK_ADMIN;
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.clearCookie('jwt_token');
      return res.redirect('/login');
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('jwt_token');
    if (req.xhr || req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    return res.redirect('/login');
  }
};

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const sysUsername = process.env.ADMIN_USERNAME || 'admin';
  const sysPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'All login credentials are required.' });
  }

  // Handle Offline Sandbox Mode / Direct match for system admin
  if (getOfflineStatus()) {
    if (username === sysUsername && password === sysPassword) {
      const token = jwt.sign({ id: MOCK_ADMIN._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
      res.cookie('jwt_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      return res.json({ success: true, message: 'Access Granted! Welcome back Cyber-Admin.' });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized system credential key mismatch.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      // Fallback to check matching system defaults and seed if user table is fresh
      if (username === sysUsername && password === sysPassword) {
        // Seed default admin
        const newAdmin = new User({ username, password });
        await newAdmin.save();
        const token = jwt.sign({ id: newAdmin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('jwt_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.json({ success: true, message: 'Seed Account Created. Welcome Cyber-Admin!' });
      }
      return res.status(401).json({ success: false, message: 'Unauthorized system credential key mismatch.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Decryption failed: Incorrect key/password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('jwt_token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, message: 'Access Granted! Decryption successful.' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Security Core Exception.' });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('jwt_token');
  res.json({ success: true, message: 'Session Cleared. System Secure.' });
});

module.exports = {
  router,
  protectAdmin
};
