const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Student, Course, Enrollment, Payment } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const studentOnly = [authMiddleware, rbac(['student', 'admin'])];

// ============================================================
// ONE-TIME FIX — GET /api/student/fix-three-columns
// Adds language, timezone, theme with correct SQL syntax
// DELETE THIS ROUTE after running once
// ============================================================
router.get('/fix-three-columns', async (req, res) => {
  const { sequelize } = require('../config/database');
  const results = [];
  const fixes = [
    { col: 'language', sql: "ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en'" },
    { col: 'timezone', sql: "ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Kolkata'" },
    { col: 'theme',    sql: "ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'light'" },
  ];
  for (const { col, sql } of fixes) {
    try {
      await sequelize.query(sql);
      results.push({ column: col, status: 'added' });
    } catch (e) {
      if (e.original?.errno === 1060 || e.parent?.errno === 1060) {
        results.push({ column: col, status: 'already_exists' });
      } else {
        results.push({ column: col, status: 'error', message: e.message });
      }
    }
  }
  return res.json({ success: true, results });
});



// ============================================================
// ONE-TIME MIGRATION — GET /api/student/migrate-profile-columns
// Hit this URL once to add all missing profile columns to Aiven DB
// Safe to run multiple times — skips existing columns
// ============================================================
router.get('/migrate-profile-columns', async (req, res) => {
  const { sequelize } = require('../config/database');
  const results = [];
  const columns = [
    'education_level VARCHAR(100)',
    'institution VARCHAR(255)',
    'graduation_year VARCHAR(10)',
    'field_of_study VARCHAR(255)',
    'work_experience_years VARCHAR(50)',
    'current_employer VARCHAR(255)',
    'current_designation VARCHAR(255)',
    'skills TEXT',
    'languages VARCHAR(255)',
    'certifications TEXT',
    'hobbies VARCHAR(255)',
    'emergency_contact_name VARCHAR(255)',
    'emergency_contact_phone VARCHAR(50)',
    'emergency_contact_relation VARCHAR(100)',
    'preferred_role VARCHAR(255)',
    'preferred_location VARCHAR(255)',
    'preferred_salary_min VARCHAR(50)',
    'preferred_salary_max VARCHAR(50)',
    'employment_type VARCHAR(100)',
    'work_mode VARCHAR(100)',
    'notice_period VARCHAR(100)',
    'open_to_relocation VARCHAR(20)',
    'industries VARCHAR(255)',
    'company_size VARCHAR(100)',
    'key_skills TEXT',
    'career_goals TEXT',
    'corporate_visible BOOLEAN DEFAULT FALSE',
    'resume_url VARCHAR(500)',
    'resume_name VARCHAR(255)',
    'psycho_result TEXT',
    'linkedin VARCHAR(255)',
    'github VARCHAR(255)',
    'twitter VARCHAR(255)',
    'portfolio VARCHAR(255)',
    'street VARCHAR(255)',
    'city VARCHAR(100)',
    'state VARCHAR(100)',
    'country VARCHAR(100)',
    'postal_code VARCHAR(20)',
    'bio TEXT',
    'date_of_birth DATE',
    'gender VARCHAR(20)',
    'profile_photo TEXT',
    `language VARCHAR(10) DEFAULT 'en'`,
    `timezone VARCHAR(50) DEFAULT 'Asia/Kolkata'`,
    'email_notifications BOOLEAN DEFAULT TRUE',
    'sms_notifications BOOLEAN DEFAULT FALSE',
    `theme VARCHAR(20) DEFAULT 'light'`,
    'two_factor_enabled BOOLEAN DEFAULT FALSE',
    'testgen_active BOOLEAN DEFAULT FALSE',
    'testgen_plan VARCHAR(50)',
  ];

  for (const col of columns) {
    const name = col.split(' ')[0];
    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN ${col}`);
      results.push({ column: name, status: 'added' });
    } catch (e) {
      if (e.original?.errno === 1060 || e.parent?.errno === 1060) {
        results.push({ column: name, status: 'already_exists' });
      } else {
        results.push({ column: name, status: 'error', message: e.message });
      }
    }
  }

  const added = results.filter(r => r.status === 'added').length;
  const existing = results.filter(r => r.status === 'already_exists').length;
  const errors = results.filter(r => r.status === 'error');

  return res.json({ success: true, added, existing, errors, results });
});

// ============================================================
// DASHBOARD STATS
// GET /api/student/dashboard/stats
// ============================================================
router.get('/dashboard/stats', ...studentOnly, async (req, res) => {
  try {
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });
    const studentId = studentRecord?.id;

    let enrollments = [];
    if (studentId) {
      enrollments = await Enrollment.findAll({
        where: { student_id: studentId },
        include: [{ model: Course, attributes: ['course_name', 'duration_hours'] }],
        order: [['created_at', 'DESC']]
      });
    }

    const completedCourses  = enrollments.filter(e => (e.progress_percentage || 0) >= 100).length;
    const inProgressCourses = enrollments.filter(e => (e.progress_percentage || 0) < 100).length;
    const totalWatchTime    = enrollments.reduce((sum, e) => sum + (e.Course?.duration_hours || 0), 0);
    const avgProgress       = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
      : 0;

    const courseProgress = enrollments.slice(0, 5).map(e => ({
      name:     e.Course?.course_name || 'Unknown',
      progress: e.progress_percentage || 0
    }));

    const activities = enrollments.slice(0, 5).map(e => ({
      title: `Enrolled in ${e.Course?.course_name || 'a course'}`,
      time:  new Date(e.created_at).toLocaleDateString()
    }));

    return res.json({
      success: true,
      stats: {
        totalCourses:     enrollments.length,
        completedCourses,
        inProgress:       inProgressCourses,
        certificates:     completedCourses,
        hoursLearned:     totalWatchTime,
        avgProgress,
        avgScore:         0,
        streakDays:       0,
        courseProgress
      },
      activities
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Keep old /dashboard route for backwards compat
router.get('/dashboard', ...studentOnly, async (req, res) => {
  return res.redirect('/api/student/dashboard/stats');
});

// ============================================================
// NOTIFICATIONS
// GET /api/student/notifications
// ============================================================
router.get('/notifications', ...studentOnly, async (req, res) => {
  try {
    const { Notification } = require('../models');
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20
    }).catch(() => []);

    return res.json({
      success: true,
      notifications: notifications.map(n => ({
        id:      n.id,
        title:   n.title,
        message: n.message,
        type:    n.type || 'info',
        time:    n.created_at,
        read:    n.is_read || false
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json({ success: true, notifications: [] });
  }
});

// ============================================================
// PAYMENTS
// GET /api/student/payments
// ============================================================
router.get('/payments', ...studentOnly, async (req, res) => {
  try {
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });

    let payments = [];
    if (studentRecord) {
      try {
        payments = await Payment.findAll({
          where: { student_id: studentRecord.id },
          include: [{ model: Course, attributes: ['course_name'] }],
          order: [['created_at', 'DESC']]
        });
      } catch (e) {
        payments = [];
      }
    }

    const formattedPayments = payments.map(p => ({
      id:             p.id,
      transaction_id: p.razorpay_payment_id || p.razorpay_order_id || `TXN-${p.id}`,
      course_name:    p.Course?.course_name || 'N/A',
      amount:         p.amount || 0,
      status:         p.payment_status || 'completed',
      date:           p.paid_at || p.created_at
    }));

    return res.json({ success: true, payments: formattedPayments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROGRESS
// GET /api/student/progress
// ============================================================
router.get('/progress', ...studentOnly, async (req, res) => {
  try {
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });

    let enrollments = [];
    if (studentRecord) {
      enrollments = await Enrollment.findAll({
        where: { student_id: studentRecord.id },
        include: [{ model: Course, attributes: ['course_name', 'category'] }]
      });
    }

    const completedCourses = enrollments.filter(e => (e.progress_percentage || 0) >= 100).length;
    const completionRate   = enrollments.length > 0
      ? Math.round((completedCourses / enrollments.length) * 100)
      : 0;

    const categoryMap = {};
    enrollments.forEach(e => {
      const cat = e.Course?.category || 'General';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, progress: 0 };
      categoryMap[cat].total++;
      categoryMap[cat].progress += (e.progress_percentage || 0);
    });

    const categoryProgress = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      courses:  data.total,
      progress: Math.round(data.progress / data.total)
    }));

    return res.json({
      success: true,
      analytics: {
        streakDays:       0,
        averageScore:     0,
        completionRate,
        categoryProgress
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// GAMIFICATION
// GET /api/student/gamification
// ============================================================
router.get('/gamification', ...studentOnly, async (req, res) => {
  try {
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });
    const studentId = studentRecord?.id;

    let xp = 0, level = 1;
    let leaderboard = [];

    if (studentId) {
      const enrollments = await Enrollment.findAll({
        where: { student_id: studentId }
      });
      xp = enrollments.length * 50 +
        enrollments.filter(e => (e.progress_percentage || 0) >= 100).length * 200;
      level = Math.floor(xp / 500) + 1;

      const allStudents = await Student.findAll({
        include: [{ model: User, as: 'user', attributes: ['full_name', 'profile_photo'] }],
        limit: 10
      }).catch(() => []);

      leaderboard = allStudents.map((s, i) => ({
        rank:   i + 1,
        name:   s.user?.full_name || 'Student',
        avatar: '🎓',
        xp:     Math.floor(Math.random() * 2000) + 500,
        isYou:  s.user_id === req.user.id
      })).sort((a, b) => b.xp - a.xp);
    }

    return res.json({ success: true, xp, level, leaderboard });
  } catch (error) {
    console.error('Error fetching gamification:', error);
    res.json({ success: true, xp: 0, level: 1, leaderboard: [] });
  }
});

// ============================================================
// PROFILE — GET COMPLETE PROFILE
// GET /api/student/profile/complete
// ============================================================
router.get('/profile/complete', ...studentOnly, async (req, res) => {
  try {
    // ✅ FIX: Use raw SQL instead of User.findByPk()
    // User.findByPk() only returns columns defined in the Sequelize model.
    // The extra profile columns (bio, gender, city, state, linkedin, skills, etc.)
    // were added later via raw SQL migrations and are NOT in the model definition,
    // so findByPk() silently ignores them — causing the profile to appear blank
    // after saving. Raw SQL returns ALL actual columns from the database.
    const { sequelize } = require('../config/database');
    const [rows] = await sequelize.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      { replacements: [req.user.id] }
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Never send password hash to frontend
    delete user.password_hash;

    let psycho_result = null;
    try { if (user.psycho_result) psycho_result = JSON.parse(user.psycho_result); } catch {}

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
        social: {
          linkedin:  user.linkedin  || '',
          github:    user.github    || '',
          twitter:   user.twitter   || '',
          portfolio: user.portfolio || '',
        },
        additional: {
          education_level:            user.education_level            || '',
          institution:                user.institution                || '',
          graduation_year:            user.graduation_year            || '',
          field_of_study:             user.field_of_study             || '',
          work_experience_years:      user.work_experience_years      || '',
          current_employer:           user.current_employer           || '',
          current_designation:        user.current_designation        || '',
          skills:                     user.skills                     || '',
          languages:                  user.languages                  || '',
          certifications:             user.certifications             || '',
          hobbies:                    user.hobbies                    || '',
          emergency_contact_name:     user.emergency_contact_name     || '',
          emergency_contact_phone:    user.emergency_contact_phone    || '',
          emergency_contact_relation: user.emergency_contact_relation || '',
        },
        job_preferences: {
          preferred_role:       user.preferred_role       || '',
          preferred_location:   user.preferred_location   || '',
          preferred_salary_min: user.preferred_salary_min || '',
          preferred_salary_max: user.preferred_salary_max || '',
          employment_type:      user.employment_type      || '',
          work_mode:            user.work_mode            || '',
          notice_period:        user.notice_period        || '',
          open_to_relocation:   user.open_to_relocation   || '',
          industries:           user.industries           || '',
          company_size:         user.company_size         || '',
          key_skills:           user.key_skills           || '',
          career_goals:         user.career_goals         || '',
        },
        resume_url:        user.resume_url        || null,
        resume_name:       user.resume_name       || null,
        corporate_visible: user.corporate_visible ?? false,
        psycho_result,
        preferences: {
          language:            user.language            || 'en',
          timezone:            user.timezone            || 'Asia/Kolkata',
          email_notifications: user.email_notifications ?? true,
          sms_notifications:   user.sms_notifications   ?? false,
          theme:               user.theme               || 'light',
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
    const { full_name, phone, date_of_birth, gender, bio, profile_photo } = req.body;

    // ✅ FIX: Use raw SQL instead of User.update().
    // bio, gender, date_of_birth, profile_photo are migrated columns NOT in
    // the Sequelize User model. User.update() silently ignores them even
    // though they exist in the database — so saves appeared to succeed
    // (returned {success:true}) but nothing was written.
    const { sequelize } = require('../config/database');

    const allUpdates = {
      full_name:     full_name?.trim()  || null,
      phone:         phone?.trim()      || null,
      date_of_birth: date_of_birth      || null,
      gender:        gender             || null,
      bio:           bio?.trim()        || null,
    };
    if (profile_photo) allUpdates.profile_photo = profile_photo;

    const setClauses   = [];
    const replacements = [];
    Object.entries(allUpdates).forEach(([key, val]) => {
      if (val !== undefined) { setClauses.push(`${key} = ?`); replacements.push(val); }
    });

    if (setClauses.length > 0) {
      replacements.push(req.user.id);
      await sequelize.query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
        { replacements }
      );
    }

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
    const { street, city, state, country, postal_code } = req.body;

    // ✅ FIX: Raw SQL — street, city, state, country, postal_code are
    // migrated columns not in the Sequelize model. User.update() skips them.
    const { sequelize } = require('../config/database');
    const allAddr = { street, city, state, country, postal_code };
    const setClauses   = [];
    const replacements = [];
    Object.entries(allAddr).forEach(([key, val]) => {
      if (val !== undefined) { setClauses.push(`${key} = ?`); replacements.push(val || null); }
    });

    if (setClauses.length > 0) {
      replacements.push(req.user.id);
      await sequelize.query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
        { replacements }
      );
    }

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
    const { linkedin, github, twitter, portfolio } = req.body;

    // ✅ FIX: Raw SQL — linkedin, github, twitter, portfolio are
    // migrated columns not in the Sequelize model. User.update() skips them.
    const { sequelize } = require('../config/database');
    const allSocial = { linkedin, github, twitter, portfolio };
    const setClauses   = [];
    const replacements = [];
    Object.entries(allSocial).forEach(([key, val]) => {
      if (val !== undefined) { setClauses.push(`${key} = ?`); replacements.push(val || null); }
    });

    if (setClauses.length > 0) {
      replacements.push(req.user.id);
      await sequelize.query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
        { replacements }
      );
    }

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
    const { language, timezone, email_notifications, sms_notifications, theme } = req.body;
    // ✅ FIX: Raw SQL — all 5 fields are migrated columns not in the model
    const { sequelize } = require('../config/database');
    await sequelize.query(
      `UPDATE users SET language=?, timezone=?, email_notifications=?, sms_notifications=?, theme=? WHERE id=?`,
      { replacements: [language||'en', timezone||'Asia/Kolkata', email_notifications??true, sms_notifications??false, theme||'light', req.user.id] }
    );
    return res.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — PHOTO UPLOAD (base64)
// PUT /api/student/profile/photo
// ============================================================
router.put('/profile/photo', ...studentOnly, async (req, res) => {
  try {
    const { profile_photo } = req.body;
    if (!profile_photo) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }
    // ✅ FIX: Raw SQL — profile_photo is a migrated column not in the model
    const { sequelize } = require('../config/database');
    await sequelize.query(
      'UPDATE users SET profile_photo = ? WHERE id = ?',
      { replacements: [profile_photo, req.user.id] }
    );
    return res.json({ success: true, profile_photo });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — CORPORATE VISIBILITY
// PUT /api/student/profile/corporate-visibility
// ============================================================
router.put('/profile/corporate-visibility', ...studentOnly, async (req, res) => {
  try {
    const { visible } = req.body;
    // ✅ FIX: Raw SQL — corporate_visible is a migrated column not in the model
    const { sequelize } = require('../config/database');
    await sequelize.query(
      'UPDATE users SET corporate_visible = ? WHERE id = ?',
      { replacements: [visible === true || visible === 'true' ? 1 : 0, req.user.id] }
    );
    return res.json({ success: true, message: 'Corporate visibility updated' });
  } catch (error) {
    console.error('Corporate visibility error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PROFILE — RESUME UPLOAD
// POST /api/student/profile/resume
// ============================================================
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'resumes');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.user.id}-${Date.now()}${ext}`);
  },
});
const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files allowed'));
  },
});

router.post('/profile/resume', ...studentOnly, uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const resumeUrl  = `/uploads/resumes/${req.file.filename}`;
    const resumeName = req.file.originalname;

    // ✅ FIX: Raw SQL — resume_url, resume_name are migrated columns not in model
    const { sequelize } = require('../config/database');
    await sequelize.query(
      'UPDATE users SET resume_url=?, resume_name=? WHERE id=?',
      { replacements: [resumeUrl, resumeName, req.user.id] }
    );

    return res.json({ success: true, url: resumeUrl, name: resumeName });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// ============================================================
// PROFILE — AI BIO ENHANCER
// POST /api/student/profile/ai-enhance
// ============================================================
router.post('/profile/ai-enhance', ...studentOnly, async (req, res) => {
  try {
    const { bio, full_name } = req.body;
    if (!bio || !bio.trim()) {
      return res.status(400).json({ success: false, message: 'Bio is required' });
    }

    const firstName = (full_name || '').split(' ')[0] || 'The student';
    let enhanced_bio = '';

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic();
        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Rewrite this bio to be more professional and compelling for MBA recruiters. Keep it 3–4 sentences, first person, no bullet points:\n\n${bio}`
          }]
        });
        enhanced_bio = message.content[0]?.text || '';
      } catch (aiErr) {
        console.error('Anthropic API error:', aiErr.message);
      }
    }

    if (!enhanced_bio) {
      enhanced_bio = `${full_name || 'I'} is a driven MBA professional with a strong foundation in business strategy, analytical thinking, and cross-functional leadership. With a passion for delivering measurable results and a commitment to continuous growth, ${firstName} brings a unique blend of academic rigour and real-world problem-solving. Known for clear communication and a collaborative approach, ${firstName} is poised to make a meaningful impact in the corporate landscape.`;
    }

    return res.json({ success: true, enhanced_bio });
  } catch (error) {
    console.error('AI enhance error:', error);
    res.status(500).json({ success: false, message: 'Enhancement failed' });
  }
});

// ============================================================
// PROFILE — SAVE PSYCHOMETRIC RESULT
// POST /api/student/profile/psychometric
// ============================================================
router.post('/profile/psychometric', ...studentOnly, async (req, res) => {
  try {
    const { result } = req.body;
    if (!result) return res.status(400).json({ success: false, message: 'Result is required' });
    // ✅ FIX: Raw SQL — psycho_result is a migrated column not in the model
    const { sequelize } = require('../config/database');
    await sequelize.query(
      'UPDATE users SET psycho_result = ? WHERE id = ?',
      { replacements: [JSON.stringify(result), req.user.id] }
    );
    return res.json({ success: true, message: 'Psychometric result saved' });
  } catch (error) {
    console.error('Psychometric save error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// SETTINGS — GET
// GET /api/student/settings
// ============================================================
router.get('/settings', ...studentOnly, async (req, res) => {
  try {
    // ✅ FIX: Raw SQL — email_notifications, sms_notifications, theme,
    // language, timezone are migrated columns not in the Sequelize model.
    const { sequelize } = require('../config/database');
    const [rows] = await sequelize.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      { replacements: [req.user.id] }
    );
    const user = rows[0] || {};

    return res.json({
      success: true,
      notifications: {
        emailNotifications:  user.email_notifications ?? true,
        courseUpdates:       true,
        newContent:          true,
        deadlineReminders:   true,
        discussionReplies:   true,
        certificateAlerts:   true,
        promotionalEmails:   false,
        weeklyDigest:        true,
        smsNotifications:    user.sms_notifications ?? false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail:         false,
        showPhone:         false,
        showProgress:      true,
        allowMessages:     true,
      },
      appearance: {
        theme:    user.theme    || 'light',
        language: user.language || 'en',
        timezone: user.timezone || 'Asia/Kolkata',
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// SETTINGS — UPDATE NOTIFICATIONS
// PUT /api/student/settings/notifications
// ============================================================
router.put('/settings/notifications', ...studentOnly, async (req, res) => {
  try {
    const { emailNotifications, smsNotifications } = req.body;
    // ✅ FIX: Raw SQL — email_notifications, sms_notifications are migrated
    const { sequelize } = require('../config/database');
    await sequelize.query(
      'UPDATE users SET email_notifications=?, sms_notifications=? WHERE id=?',
      { replacements: [emailNotifications ?? true, smsNotifications ?? false, req.user.id] }
    );
    return res.json({ success: true, message: 'Notification settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings/privacy', ...studentOnly, async (req, res) => {
  return res.json({ success: true, message: 'Privacy settings updated' });
});

router.put('/settings/appearance', ...studentOnly, async (req, res) => {
  try {
    const { theme, language, timezone } = req.body;
    // ✅ FIX: Raw SQL — theme, language, timezone are migrated columns
    const { sequelize } = require('../config/database');
    await sequelize.query(
      'UPDATE users SET theme=?, language=?, timezone=? WHERE id=?',
      { replacements: [theme||'light', language||'en', timezone||'Asia/Kolkata', req.user.id] }
    );
    return res.json({ success: true, message: 'Appearance settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// DELETE ACCOUNT
// DELETE /api/student/account
// ============================================================
router.delete('/account', ...studentOnly, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.user.id } });
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
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
    console.log(`Support query from user ${req.user.id} [${category}]: ${query}`);
    return res.json({ success: true, message: 'Query submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// CERTIFICATES
// GET /api/student/certificates
// ============================================================
router.get('/certificates', ...studentOnly, async (req, res) => {
  try {
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });

    let completedEnrollments = [];
    if (studentRecord) {
      completedEnrollments = await Enrollment.findAll({
        where: { student_id: studentRecord.id, progress_percentage: 100 },
        include: [{ model: Course, attributes: ['course_name'] }]
      });
    }

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
    return res.json({ success: true, message: 'Certificate download endpoint' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// ASSIGNMENTS — GET LIST
// GET /api/student/assignments
// ============================================================
router.get('/assignments', ...studentOnly, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });
    if (!studentRecord) return res.json({ success: true, assignments: [] });

    const enrollments = await Enrollment.findAll({
      where: { student_id: studentRecord.id },
      attributes: ['course_id']
    });
    const courseIds = enrollments.map(e => e.course_id);
    if (!courseIds.length) return res.json({ success: true, assignments: [] });

    await sequelize.query(`CREATE TABLE IF NOT EXISTS assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255), description TEXT,
      course_id INT, faculty_id INT,
      due_date DATE, total_marks INT DEFAULT 100,
      rubric JSON, status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await sequelize.query(`CREATE TABLE IF NOT EXISTS assignment_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      assignment_id INT, student_id INT,
      file_path VARCHAR(500), file_name VARCHAR(255),
      notes TEXT, grade INT, feedback TEXT,
      status VARCHAR(50) DEFAULT 'submitted',
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const placeholders = courseIds.map(() => '?').join(',');
    const [assignments] = await sequelize.query(
      `SELECT a.*, c.course_name
       FROM assignments a
       LEFT JOIN courses c ON c.id = a.course_id
       WHERE a.course_id IN (${placeholders}) AND a.status = 'active'
       ORDER BY a.due_date ASC`,
      { replacements: courseIds }
    );

    const assignmentIds = assignments.map(a => a.id);
    let submissions = [];
    if (assignmentIds.length) {
      const subPlaceholders = assignmentIds.map(() => '?').join(',');
      [submissions] = await sequelize.query(
        `SELECT * FROM assignment_submissions
         WHERE student_id = ? AND assignment_id IN (${subPlaceholders})`,
        { replacements: [studentRecord.id, ...assignmentIds] }
      );
    }

    const subMap = {};
    submissions.forEach(s => { subMap[s.assignment_id] = s; });

    const result = assignments.map(a => {
      const sub = subMap[a.id];
      return {
        id:           a.id,
        title:        a.title,
        description:  a.description,
        course_name:  a.course_name || 'Unknown Course',
        due_date:     a.due_date,
        total_marks:  a.total_marks,
        rubric:       a.rubric ? (typeof a.rubric === 'string' ? JSON.parse(a.rubric) : a.rubric) : null,
        status:       sub ? sub.status : 'pending',
        grade:        sub?.grade ?? null,
        feedback:     sub?.feedback ?? null,
        submitted_at: sub?.submitted_at ?? null,
        file_name:    sub?.file_name ?? null,
      };
    });

    res.json({ success: true, assignments: result });
  } catch (e) {
    console.error('GET /student/assignments error:', e);
    res.json({ success: true, assignments: [] });
  }
});

// ============================================================
// ASSIGNMENTS — SUBMIT
// POST /api/student/assignments/:id/submit
// ============================================================
router.post('/assignments/:id/submit', ...studentOnly, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const studentRecord = await Student.findOne({ where: { user_id: req.user.id } });
    if (!studentRecord) return res.status(403).json({ success: false, message: 'Student not found' });

    const assignmentId = parseInt(req.params.id);
    const { notes, file_name } = req.body;

    const [existing] = await sequelize.query(
      `SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ? LIMIT 1`,
      { replacements: [assignmentId, studentRecord.id] }
    );

    if (existing.length > 0) {
      await sequelize.query(
        `UPDATE assignment_submissions
         SET notes=?, file_name=?, status='submitted', submitted_at=NOW(), grade=NULL, feedback=NULL
         WHERE assignment_id=? AND student_id=?`,
        { replacements: [notes || null, file_name || null, assignmentId, studentRecord.id] }
      );
    } else {
      await sequelize.query(
        `INSERT INTO assignment_submissions (assignment_id, student_id, notes, file_name, status, submitted_at)
         VALUES (?, ?, ?, ?, 'submitted', NOW())`,
        { replacements: [assignmentId, studentRecord.id, notes || null, file_name || null] }
      );
    }

    res.json({ success: true, message: 'Assignment submitted successfully' });
  } catch (e) {
    console.error('POST /student/assignments/:id/submit error:', e);
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

// ============================================================
// PAYMENTS — TESTGEN SUBSCRIPTION
// POST /api/student/payments/testgen
// ============================================================
router.post('/payments/testgen', ...studentOnly, async (req, res) => {
  try {
    const { plan } = req.body;
    const amount = plan === 'annual' ? 3999 : 499;

    try {
      const { sequelize } = require('../config/database');
      await sequelize.query(
        `INSERT INTO payments (user_id, plan_type, amount, status, transaction_id, created_at, updated_at)
         VALUES (?, ?, ?, 'success', ?, NOW(), NOW())`,
        { replacements: [req.user.id, plan, amount, `TGN-${Date.now()}`] }
      );
    } catch (dbErr) {
      console.warn('TestGen payment DB insert warning:', dbErr.message);
    }

    await sequelize.query(
      'UPDATE users SET testgen_active=?, testgen_plan=? WHERE id=?',
      { replacements: [true, plan, req.user.id] }
    );

    return res.json({ success: true, message: `TestGen ${plan} plan activated` });
  } catch (error) {
    console.error('TestGen payment error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
});

// ============================================================
// PROFILE — GET ADDITIONAL INFO
// GET /api/student/profile/additional
// ============================================================
router.get('/profile/additional', ...studentOnly, async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden. Students only.' });
    }

    // ✅ FIX: Raw SQL — all additional columns are migrated, not in model
    const { sequelize } = require('../config/database');
    const [rows] = await sequelize.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      { replacements: [req.user.id] }
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      additional: {
        education_level:            user.education_level            || '',
        institution:                user.institution                || '',
        graduation_year:            user.graduation_year            || '',
        field_of_study:             user.field_of_study             || '',
        work_experience_years:      user.work_experience_years      || '',
        current_employer:           user.current_employer           || '',
        current_designation:        user.current_designation        || '',
        skills:                     user.skills                     || '',
        languages:                  user.languages                  || '',
        certifications:             user.certifications             || '',
        hobbies:                    user.hobbies                    || '',
        emergency_contact_name:     user.emergency_contact_name     || '',
        emergency_contact_phone:    user.emergency_contact_phone    || '',
        emergency_contact_relation: user.emergency_contact_relation || '',
      }
    });
  } catch (error) {
    console.error('Error fetching additional info:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============================================================
// PROFILE — ADDITIONAL INFO
// PUT /api/student/profile/additional
// ============================================================
router.put('/profile/additional', ...studentOnly, async (req, res) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access forbidden. Students only.' });
    }

    const {
      education_level, institution, graduation_year, field_of_study,
      work_experience_years, current_employer, current_designation,
      skills, languages, certifications, hobbies,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation
    } = req.body;

    const { sequelize } = require('../config/database');

    // ✅ FIX: Auto-create any missing columns, then save with raw SQL.
    // Previously crashed with 500 if migration hadn't been run yet.
    const REQUIRED_COLS = [
      'education_level VARCHAR(100)', 'institution VARCHAR(255)',
      'graduation_year VARCHAR(10)',  'field_of_study VARCHAR(255)',
      'work_experience_years VARCHAR(50)', 'current_employer VARCHAR(255)',
      'current_designation VARCHAR(255)', 'skills TEXT',
      'languages VARCHAR(255)', 'certifications TEXT', 'hobbies VARCHAR(255)',
      'emergency_contact_name VARCHAR(255)', 'emergency_contact_phone VARCHAR(50)',
      'emergency_contact_relation VARCHAR(100)',
    ];
    for (const col of REQUIRED_COLS) {
      try { await sequelize.query(`ALTER TABLE users ADD COLUMN ${col}`); }
      catch (e) { /* errno 1060 = column already exists — safe to ignore */ }
    }

    const allUpdates = {
      education_level, institution, graduation_year, field_of_study,
      work_experience_years, current_employer, current_designation,
      skills, languages, certifications, hobbies,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    };

    const setClauses   = [];
    const replacements = [];
    Object.entries(allUpdates).forEach(([key, val]) => {
      if (val !== undefined) { setClauses.push(`${key} = ?`); replacements.push(val || null); }
    });

    if (setClauses.length === 0) {
      return res.json({ success: true, message: 'Nothing to update' });
    }

    replacements.push(req.user.id);
    await sequelize.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
      { replacements }
    );

    return res.json({ success: true, message: 'Additional information saved' });
  } catch (error) {
    console.error('Error saving additional info:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============================================================
// PROFILE — JOB PREFERENCES
// PUT /api/student/profile/job-preferences
// ============================================================
router.put('/profile/job-preferences', ...studentOnly, async (req, res) => {
  try {
    const {
      preferred_role, preferred_location, preferred_salary_min, preferred_salary_max,
      employment_type, work_mode, notice_period, open_to_relocation,
      industries, company_size, key_skills, career_goals
    } = req.body;

    const { sequelize } = require('../config/database');

    // Raw SQL — bypasses Sequelize model cache, works in production
    await sequelize.query(
      `UPDATE users SET
        preferred_role = ?,
        preferred_location = ?,
        preferred_salary_min = ?,
        preferred_salary_max = ?,
        employment_type = ?,
        work_mode = ?,
        notice_period = ?,
        open_to_relocation = ?,
        industries = ?,
        company_size = ?,
        key_skills = ?,
        career_goals = ?
       WHERE id = ?`,
      {
        replacements: [
          preferred_role || null,
          preferred_location || null,
          preferred_salary_min || null,
          preferred_salary_max || null,
          employment_type || null,
          work_mode || null,
          notice_period || null,
          open_to_relocation || null,
          industries || null,
          company_size || null,
          key_skills || null,
          career_goals || null,
          req.user.id
        ]
      }
    );

    return res.json({ success: true, message: 'Job preferences saved' });
  } catch (error) {
    console.error('Error saving job preferences:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ============================================================
// AUTH — CHANGE PASSWORD
// POST /api/student/auth/change-password
// ============================================================
router.post('/auth/change-password', ...studentOnly, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');

    const currentPassword = req.body.current_password || req.body.currentPassword;
    const newPassword     = req.body.new_password     || req.body.newPassword;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const passwordField = user.password_hash || user.password;
    const isValid = await bcrypt.compare(currentPassword, passwordField);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updateFields = user.password_hash !== undefined
      ? { password_hash: hashed }
      : { password: hashed };

    await User.update(updateFields, { where: { id: req.user.id } });
    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;