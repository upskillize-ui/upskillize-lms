const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const crypto = require('crypto');
const { User, Student, Faculty } = require('../models');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { sendEmail } = require('../config/email');

// Register
router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  validate
], async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      full_name,
      email,
      password_hash,
      role,
      phone
    });

    // Create role-specific record
    if (role === 'student') {
      const enrollmentNumber = 'STU' + Date.now();
      await Student.create({
        user_id: user.id,
        enrollment_number: enrollmentNumber
      });
    } else if (role === 'faculty') {
      const employeeId = 'FAC' + Date.now();
      await Faculty.create({
        user_id: user.id,
        employee_id: employeeId
      });
    }

    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to Upskillize!',
        `<h1>Welcome ${full_name}!</h1><p>Your account has been created successfully.</p>`
      );
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering user',
      error: error.message 
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: 'Account is inactive. Please contact administrator.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'student') {
      roleData = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'faculty') {
      roleData = await Faculty.findOne({ where: { user_id: user.id } });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email,
        roleDataId: roleData?.id
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile_photo: user.profile_photo,
        roleDataId: roleData?.id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during login',
      error: error.message 
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ 
        success: true,
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    );

    res.json({ 
      success: true,
      message: 'If the email exists, a reset link has been sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing request' 
    });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
], async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({ 
      where: { 
        reset_token: token,
        reset_token_expiry: { [require('sequelize').Op.gt]: new Date() }
      } 
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    res.json({ 
      success: true,
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error resetting password' 
    });
  }
});

// Get Current User
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expiry'] },
      include: [
        { model: Student },
        { model: Faculty }
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      user 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
});

// ─── Google OAuth ───────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const db = require('../config/db'); // adjust path if needed
    const email = profile.emails[0].value;

    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows[0];

    if (!user) {
      // Create new user
      const [result] = await db.query(
        'INSERT INTO users (full_name, email, role, phone, password) VALUES (?, ?, ?, ?, ?)',
        [profile.displayName, email, 'student', '', 'google_oauth']
      );
      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUser[0];
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Google login - redirects to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google callback - Google redirects back here
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);
// ────────────────────────────────────────────────────────────

// Logout (client-side token removal, but can log here)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

module.exports = router;
