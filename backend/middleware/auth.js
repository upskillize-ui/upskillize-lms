// backend/middleware/auth.js
// FIXED VERSION - Proper exports for all route files

const jwt = require('jsonwebtoken');
const db = require('../models');

// Main authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

// Alias for compatibility
const authenticateToken = authMiddleware;

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is faculty
const requireFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Faculty access required' 
    });
  }
  next();
};

// Middleware to check if user is student
const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false,
      message: 'Student access required' 
    });
  }
  next();
};

// FIXED: Export both as default AND named exports for compatibility
module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.authenticateToken = authenticateToken; // ← ADD THIS
module.exports.requireAdmin = requireAdmin;
module.exports.requireFaculty = requireFaculty;
module.exports.requireStudent = requireStudent;