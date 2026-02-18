const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Student, Course, Enrollment, Payment } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// ============================================================
// SHORTHAND — matches your existing codebase pattern
// ============================================================
const studentOnly = [authMiddleware, rbac(['student', 'admin'])];

// ============================================================
// DASHBOARD
// GET /api/student/dashboard
// ============================================================
router.get('/dashboard', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      include: [{ model: Course }]
    });

    const completedCourses  = enrollments.filter(e => e.progress_percentage === 100).length;
    const inProgressCourses = enrollments.filter(e => e.progress_percentage < 100).length;

    // Total watch time — sum duration_hours of enrolled courses
    const totalWatchTime = enrollments.reduce((sum, e) => {
      return sum + (e.Course?.duration_hours || 0);
    }, 0);

    const averageGrade = enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0)
          / enrollments.length
        )
      : 0;

    const completionRate = enrollments.length > 0
      ? Math.round((completedCourses / enrollments.length) * 100)
      : 0;

    return res.json({
      success: true,
      stats: {
        enrolledCourses:  enrollments.length,
        completedCourses,
        inProgressCourses,
        certificates:     completedCourses,
        totalWatchTime,
        averageGrade,
        completionRate,
        streakDays:       0,
      },
      activities: []
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — GET COMPLETE PROFILE
// GET /api/student/profile/complete
// ============================================================
router.get('/profile/complete', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      profile: {
        personal: {
          full_name:     user.full_name     || '',
          email:         user.email         || '',
          phone:         user.phone         || '',
          date_of_birth: user.date_of_birth || '',
          gender:        user.gender        || '',
          bio:           user.bio           || '',
          profile_photo: user.profile_photo || null,
        },
        address: {
          street:      user.street      || '',
          city:        user.city        || '',
          state:       user.state       || '',
          country:     user.country     || '',
          postal_code: user.postal_code || '',
        },
        preferences: {
          language:            user.language            || 'en',
          timezone:            user.timezone            || 'Asia/Kolkata',
          email_notifications: user.email_notifications ?? true,
          sms_notifications:   user.sms_notifications   ?? false,
          theme:               user.theme               || 'light',
        },
        social: {
          linkedin:  user.linkedin  || '',
          github:    user.github    || '',
          twitter:   user.twitter   || '',
          portfolio: user.portfolio || '',
        },
        two_factor_enabled: user.two_factor_enabled || false,
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — SAVE PERSONAL INFO
// PUT /api/student/profile/personal
// ============================================================
router.put('/profile/personal', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, date_of_birth, gender, bio } = req.body;

    await User.update(
      { full_name, phone, date_of_birth, gender, bio },
      { where: { id: userId } }
    );

    return res.json({ success: true, message: 'Personal info updated' });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — SAVE ADDRESS
// PUT /api/student/profile/address
// ============================================================
router.put('/profile/address', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, country, postal_code } = req.body;

    await User.update(
      { street, city, state, country, postal_code },
      { where: { id: userId } }
    );

    return res.json({ success: true, message: 'Address updated' });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — SAVE SOCIAL LINKS
// PUT /api/student/profile/social
// ============================================================
router.put('/profile/social', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;
    const { linkedin, github, twitter, portfolio } = req.body;

    await User.update(
      { linkedin, github, twitter, portfolio },
      { where: { id: userId } }
    );

    return res.json({ success: true, message: 'Social links updated' });
  } catch (error) {
    console.error('Error updating social links:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — SAVE PREFERENCES
// PUT /api/student/profile/preferences
// ============================================================
router.put('/profile/preferences', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, timezone, email_notifications, sms_notifications, theme } = req.body;

    await User.update(
      { language, timezone, email_notifications, sms_notifications, theme },
      { where: { id: userId } }
    );

    return res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — UPLOAD PHOTO
// PUT /api/student/profile/photo
// ============================================================
router.put('/profile/photo', ...studentOnly, async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile_photo } = req.body;

    if (!profile_photo) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }

    await User.update(
      { profile_photo },
      { where: { id: userId } }
    );

    return res.json({ success: true, message: 'Photo updated' });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// SETTINGS
// GET /api/student/settings
// PUT /api/student/settings/notifications
// PUT /api/student/settings/privacy
// PUT /api/student/settings/appearance
// DELETE /api/student/account
// ============================================================
router.get('/settings', ...studentOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'email_notifications', 'sms_notifications',
        'language', 'timezone', 'theme'
      ]
    });

    return res.json({
      success: true,
      notifications: {
        emailNotifications:  user?.email_notifications ?? true,
        courseUpdates:       true,
        newContent:          true,
        deadlineReminders:   true,
        discussionReplies:   true,
        certificateAlerts:   true,
        promotionalEmails:   false,
        weeklyDigest:        true,
        smsNotifications:    user?.sms_notifications ?? false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail:         false,
        showPhone:         false,
        showProgress:      true,
        allowMessages:     true,
      },
      appearance: {
        theme:    user?.theme    || 'light',
        language: user?.language || 'en',
        timezone: user?.timezone || 'Asia/Kolkata',
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings/notifications', ...studentOnly, async (req, res) => {
  try {
    const { emailNotifications, smsNotifications } = req.body;

    await User.update(
      {
        email_notifications: emailNotifications,
        sms_notifications:   smsNotifications,
      },
      { where: { id: req.user.id } }
    );

    return res.json({ success: true, message: 'Notification settings updated' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings/privacy', ...studentOnly, async (req, res) => {
  try {
    // Store privacy settings as needed
    return res.json({ success: true, message: 'Privacy settings updated' });
  } catch (error) {
    console.error('Error updating privacy:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings/appearance', ...studentOnly, async (req, res) => {
  try {
    const { theme, language, timezone } = req.body;

    await User.update(
      { theme, language, timezone },
      { where: { id: req.user.id } }
    );

    return res.json({ success: true, message: 'Appearance settings updated' });
  } catch (error) {
    console.error('Error updating appearance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/account', ...studentOnly, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.user.id } });
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// SUPPORT
// POST /api/student/support
// ============================================================
router.post('/support', ...studentOnly, async (req, res) => {
  try {
    const { query, category } = req.body;
    // Log or save to DB as needed
    console.log(`Support query from user ${req.user.id} [${category}]: ${query}`);
    return res.json({ success: true, message: 'Query submitted successfully' });
  } catch (error) {
    console.error('Error submitting support query:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// CERTIFICATES
// GET /api/student/certificates
// GET /api/student/certificates/:id/download
// ============================================================
router.get('/certificates', ...studentOnly, async (req, res) => {
  try {
    const completedEnrollments = await Enrollment.findAll({
      where: {
        user_id:             req.user.id,
        progress_percentage: 100
      },
      include: [{ model: Course, attributes: ['course_name'] }]
    });

    const certificates = completedEnrollments.map(e => ({
      id:             e.id,
      course_name:    e.Course?.course_name || 'Unknown Course',
      certificate_id: `CERT-${e.id}-${req.user.id}`,
      issue_date:     e.updated_at || e.created_at,
    }));

    return res.json({ success: true, certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/certificates/:id/download', ...studentOnly, async (req, res) => {
  try {
    // Placeholder — implement PDF generation as needed
    return res.json({ success: true, message: 'Certificate download endpoint' });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;