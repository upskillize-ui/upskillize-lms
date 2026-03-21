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
const { requireAdmin } = require('../middleware/auth');
const { sendEmail } = require('../config/email');

// ============================================================
// REGISTER
// ✅ CHANGED: is_active: false — new users need admin approval
// ============================================================
router.post('/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('role').isIn(['student', 'faculty', 'admin', 'institute', 'corporate', 'placement']).withMessage('Invalid role'),
  validate
], async (req, res) => {
  try {
    const { full_name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (!existingUser.is_active) {
        // Reactivate and update the inactive account
        const password_hash = await bcrypt.hash(password, 10);
        await existingUser.update({
          full_name,
          password_hash,
          role,
          phone,
          is_active: false  // still needs re-approval
        });
        return res.status(200).json({
          success: true,
          message: 'Account re-registered. Awaiting admin approval before you can log in.',
          user: { id: existingUser.id, email: existingUser.email, role: existingUser.role, full_name: existingUser.full_name }
        });
      }
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // ✅ is_active: false — user cannot login until admin approves
    const user = await User.create({
      full_name,
      email,
      password_hash,
      role,
      phone,
      is_active: false
    });

    // Create role-specific records
    if (role === 'student') {
      const enrollmentNumber = 'STU' + Date.now();
      await Student.create({ user_id: user.id, enrollment_number: enrollmentNumber });
    } else if (role === 'faculty') {
      const employeeId = 'FAC' + Date.now();
      await Faculty.create({ user_id: user.id, employee_id: employeeId });
    }

    // Send welcome email
    try {
      await sendEmail(
        email,
        'Welcome to Upskillize — Account Pending Approval',
        `<h1>Welcome ${full_name}!</h1>
         <p>Your <strong>${role}</strong> account has been created successfully.</p>
         <p>Your account is currently <strong>pending admin approval</strong>. You will be able to log in once an admin activates your account.</p>
         <p>This usually takes 1–24 hours. If you have any questions, contact us at support@upskillize.com</p>`
      );
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    // Notify admin about new registration
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL || 'admin@upskillize.com',
        `New ${role} registration pending approval`,
        `<h2>New Registration</h2>
         <p><strong>Name:</strong> ${full_name}</p>
         <p><strong>Email:</strong> ${email}</p>
         <p><strong>Role:</strong> ${role}</p>
         <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
         <p>Please log in to the admin panel to approve or reject this account.</p>`
      );
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Awaiting admin approval before you can log in.',
      user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
});

// ============================================================
// LOGIN
// ✅ CHANGED: message now says "pending approval" so frontend
//            can detect it and show the pending screen
// ============================================================
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ✅ CHANGED: specific "pending approval" message so Login.jsx
    //            can detect it and show the pending approval screen
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for activation.'
      });
    }

    let roleData = null;
    if (user.role === 'student') {
      roleData = await Student.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'faculty') {
      roleData = await Faculty.findOne({ where: { user_id: user.id } });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, roleDataId: roleData?.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:            user.id,
        full_name:     user.full_name,
        email:         user.email,
        role:          user.role,
        phone:         user.phone,
        profile_photo: user.profile_photo,
        roleDataId:    roleData?.id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
});

// ============================================================
// FORGOT PASSWORD
// ============================================================
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request',
      `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    );

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
});

// ============================================================
// RESET PASSWORD
// ============================================================
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
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

// ============================================================
// GET CURRENT USER
// ============================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expiry'] },
      include: [{ model: Student }, { model: Faculty }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
});

// ============================================================
// CHANGE PASSWORD
// ============================================================
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const current_password = req.body.currentPassword || req.body.current_password;
    const new_password     = req.body.newPassword     || req.body.new_password;

    if (!current_password || !new_password)
      return res.status(400).json({ success: false, message: 'Both fields are required' });

    if (new_password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findByPk(req.user.id);
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hashed });

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// GOOGLE OAUTH
// ============================================================
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email     = profile.emails[0].value;
    const full_name = profile.displayName;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      const dummyHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = await User.create({
        full_name,
        email,
        password_hash: dummyHash,
        role:      'student',
        phone:     '',
        is_active: true   // Google users are auto-approved
      });

      await Student.create({
        user_id:           user.id,
        enrollment_number: 'STU' + Date.now()
      });
    }

    return done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return done(err, null);
  }
}));

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false
  }),
  async (req, res) => {
    try {
      let roleData = null;
      if (req.user.role === 'student') {
        roleData = await Student.findOne({ where: { user_id: req.user.id } });
      } else if (req.user.role === 'faculty') {
        roleData = await Faculty.findOne({ where: { user_id: req.user.id } });
      }

      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role, roleDataId: roleData?.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);

// ============================================================
// LOGOUT
// ============================================================
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================================
// ✅ NEW: ADMIN — GET ALL PENDING USERS
// GET /api/auth/admin/pending-users
// Used in admin dashboard to show who needs approval
// ============================================================
router.get('/admin/pending-users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { is_active: false },
      attributes: ['id', 'full_name', 'email', 'role', 'phone', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, users: pendingUsers, count: pendingUsers.length });
  } catch (error) {
    console.error('Pending users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending users' });
  }
});

// ============================================================
// ✅ NEW: ADMIN — APPROVE A USER
// POST /api/auth/admin/approve/:id
// Admin clicks Approve → user can now log in
// ============================================================
router.post('/admin/approve/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.update({ is_active: true });

    // Send approval email to user
    try {
      await sendEmail(
        user.email,
        'Your Upskillize account has been approved!',
        `<h1>Account Approved ✅</h1>
         <p>Hi ${user.full_name},</p>
         <p>Your <strong>${user.role}</strong> account on Upskillize has been approved by the admin.</p>
         <p>You can now <a href="${process.env.FRONTEND_URL}/login">log in here</a>.</p>
         <p>Welcome to Upskillize!</p>`
      );
    } catch (emailError) {
      console.error('Approval email error:', emailError);
    }

    res.json({ success: true, message: `${user.full_name} approved successfully` });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ success: false, message: 'Error approving user' });
  }
});

// ============================================================
// ✅ NEW: ADMIN — REJECT / DELETE A PENDING USER
// DELETE /api/auth/admin/reject/:id
// Admin clicks Reject → user record is removed
// ============================================================
router.delete('/admin/reject/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const name  = user.full_name;
    const email = user.email;
    const role  = user.role;

    await user.destroy();

    // Notify user of rejection
    try {
      await sendEmail(
        email,
        'Upskillize — Account Registration Update',
        `<h2>Account Not Approved</h2>
         <p>Hi ${name},</p>
         <p>Unfortunately, your <strong>${role}</strong> account registration was not approved at this time.</p>
         <p>If you believe this is an error, please contact us at support@upskillize.com</p>`
      );
    } catch (emailError) {
      console.error('Rejection email error:', emailError);
    }

    res.json({ success: true, message: `${name} rejected and removed` });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting user' });
  }
});

// ============================================================
// ✅ NEW: ADMIN — DEACTIVATE AN ACTIVE USER
// POST /api/auth/admin/deactivate/:id
// Admin can suspend an already-active account
// ============================================================
router.post('/admin/deactivate/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate an admin account' });
    }

    await user.update({ is_active: false });

    res.json({ success: true, message: `${user.full_name} deactivated successfully` });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ success: false, message: 'Error deactivating user' });
  }
});

module.exports = router;