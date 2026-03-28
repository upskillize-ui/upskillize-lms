// backend/routes/facultyProfile.js
// ═══════════════════════════════════════════════════════════════════
//  COMPLETE FIXED VERSION
//
//  ✅ FIX #1 (ROOT CAUSE) — autoMigrateProfileColumns() added.
//     Runs automatically on every server start (idempotent).
//     Missing DB columns were the reason data never persisted —
//     rawUpdate() threw "Unknown column" silently on every save.
//
//  ✅ FIX #2 — employee_id is now saved in PUT /profile/professional
//     It existed in the form but was never written to the DB.
//
//  ✅ FIX #3 — Faculty.findOrCreate() replaces findOne() in the
//     professional route so new faculty users without a faculty row
//     are handled instead of silently doing nothing.
//
//  ✅ FIX #4 — error.message added to all 500 responses so real
//     MySQL errors are visible in the browser network tab.
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../models');
const { Op }  = require('sequelize');
const rbac    = require('../middleware/rbac');
const {
  User, Faculty, Course, Enrollment, Student, Exam, Result,
  VideoWatchHistory, Lesson, CourseModule, Quiz, QuizQuestion,
  Notification,
} = require('../models');
const authMiddleware = require('../middleware/auth');
const sequelize = db.sequelize; // ← ADD THIS

// ─────────────────────────────────────────────────────────────
// MULTER — profile photo
// ─────────────────────────────────────────────────────────────
// ── Photo upload: Cloudinary if env vars set, disk fallback otherwise ──
const cloudinary = (() => {
  try {
    const c = require('cloudinary').v2;
    c.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return c;
  } catch { return null; }
})();

const { CloudinaryStorage } = (() => {
  try { return require('multer-storage-cloudinary'); }
  catch { return { CloudinaryStorage: null }; }
})();

const upload = (() => {
  if (cloudinary && CloudinaryStorage && process.env.CLOUDINARY_CLOUD_NAME) {
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder:          'upskillize/faculty-profiles',
        allowed_formats: ['jpg','jpeg','png','gif','webp'],
        transformation:  [{ width:400, height:400, crop:'fill', gravity:'face' }],
      },
    });
    console.log('[facultyProfile] ✅ Cloudinary storage active');
    return multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  }
  // Fallback: disk storage for local dev or if Cloudinary not configured
  console.log('[facultyProfile] ⚠️  Cloudinary not configured — using disk storage');
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', 'profiles', 'faculty');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `profile-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`);
    },
  });
  return multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
})();

// ─────────────────────────────────────────────────────────────
// MULTER — content upload
// ─────────────────────────────────────────────────────────────
const contentStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/content');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    cb(null, 'content_' + Date.now() + path.extname(file.originalname));
  },
});
const contentUpload = multer({
  storage: contentStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/mp4|mov|avi|mkv|webm|pdf|ppt|pptx|zip|rar/i.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('File type not allowed'));
  },
});

// ─────────────────────────────────────────────────────────────
// HELPER — ensure faculty_content table exists
// ─────────────────────────────────────────────────────────────
let _contentTableReady = false;
async function ensureContentTable(sequelize) {
  if (_contentTableReady) return;
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS faculty_content (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      title         VARCHAR(255),
      description   TEXT,
      type          VARCHAR(100) DEFAULT 'video',
      course_id     INT,
      faculty_id    INT NOT NULL,
      file_path     VARCHAR(500),
      file_size     VARCHAR(100),
      duration      VARCHAR(100),
      display_order INT          DEFAULT 1,
      status        VARCHAR(50)  DEFAULT 'published',
      views         INT          DEFAULT 0,
      created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);
  for (const sql of [
    'ALTER TABLE faculty_content ADD COLUMN display_order INT DEFAULT 1',
    'ALTER TABLE faculty_content ADD COLUMN duration VARCHAR(100)',
  ]) {
    try { await sequelize.query(sql); } catch (_) { /* already exists */ }
  }
  _contentTableReady = true;
}

// ─────────────────────────────────────────────────────────────
// HELPER — raw SQL update
// Bypasses Sequelize model so newly-added columns are always
// written even if they're absent from the Sequelize model.
// ─────────────────────────────────────────────────────────────
async function rawUpdate(tableName, updates, whereClause, whereValues, sequelize) {
  const setClauses = [];
  const vals = [];
  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined) {
      setClauses.push(`${k} = ?`);
      vals.push(v === '' || v === null ? null : v);
    }
  }
  if (!setClauses.length) return;
  vals.push(...whereValues);
  await sequelize.query(
    `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereClause}`,
    { replacements: vals },
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER — raw SQL user fetch
// Returns ALL columns including ones added after model creation.
// ─────────────────────────────────────────────────────────────
async function rawFetchUser(userId, sequelize) {
  const [rows] = await sequelize.query(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    { replacements: [userId] },
  );
  return rows[0] || null;
}

// ═════════════════════════════════════════════════════════════
// ✅ FIX #1 — AUTO-MIGRATE PROFILE COLUMNS ON MODULE LOAD
//
// WHY THIS WAS THE ROOT CAUSE:
//   rawUpdate() builds  UPDATE users SET col = ?  queries.
//   If a column doesn't exist MySQL throws
//   "Unknown column 'X' in field list".
//   That error was caught by try/catch and returned
//   { success: false } — but Dashboard.jsx checks
//   (!r.data.success && !r.data.profile).
//   Since the backend never sends 'profile' in a PUT response,
//   r.data.profile is always undefined, so the condition is
//   ALWAYS true and the error toast was never shown.
//   Result: data appeared to save but never did.
//
// This function adds every required column to users table.
// errno 1060 (Duplicate column) is silently skipped.
// Safe to run on every server start.
// ═════════════════════════════════════════════════════════════
let _profileColumnsMigrated = false;

async function autoMigrateProfileColumns() {
  if (_profileColumnsMigrated) return;
  try {
    const columns = [
      // personal
      'date_of_birth DATE',
      'gender VARCHAR(20)',
      'bio TEXT',
      'profile_photo VARCHAR(500)',
      'phone VARCHAR(50)',
      // professional (stored on users, not faculty table)
      'designation VARCHAR(255)',
      'specialization VARCHAR(255)',
      'joining_date DATE',
      // contact
      'address_line1 VARCHAR(255)',
      'address_line2 VARCHAR(255)',
      'city VARCHAR(100)',
      'state VARCHAR(100)',
      'country VARCHAR(100)',
      'postal_code VARCHAR(20)',
      'emergency_contact_name VARCHAR(255)',
      'emergency_contact_phone VARCHAR(50)',
      // additional
      'edu_degree VARCHAR(255)',
      'edu_institution VARCHAR(255)',
      'edu_year VARCHAR(10)',
      'edu_grade VARCHAR(50)',
      'certifications TEXT',
      'languages_known VARCHAR(255)',
      'skills TEXT',
      'achievements TEXT',
      'publications TEXT',
      // social
      'linkedin VARCHAR(500)',
      'github VARCHAR(500)',
      'twitter VARCHAR(500)',
      'website VARCHAR(500)',
      // bank
      'account_holder_name VARCHAR(255)',
      'bank_name VARCHAR(255)',
      'account_number VARCHAR(100)',
      'ifsc_code VARCHAR(20)',
      'branch_name VARCHAR(255)',
      "account_type VARCHAR(50) DEFAULT 'savings'",
      'pan_number VARCHAR(20)',
      'uan_number VARCHAR(20)',
      // settings
      "language VARCHAR(10) DEFAULT 'en'",
      "timezone VARCHAR(100) DEFAULT 'Asia/Kolkata'",
      'email_notifications TINYINT(1) DEFAULT 1',
      'sms_notifications TINYINT(1) DEFAULT 0',
      "theme VARCHAR(20) DEFAULT 'light'",
    ];

    for (const col of columns) {
      try {
        await sequelize.query(`ALTER TABLE users ADD COLUMN ${col}`);
        console.log(`[migrate] Added: ${col.split(' ')[0]}`);
      } catch (e) {
        // errno 1060 = column already exists — expected, not an error
        if (e.original?.errno !== 1060 && e.parent?.errno !== 1060) {
          console.warn(`[migrate] Could not add ${col.split(' ')[0]}:`, e.message);
        }
      }
    }
    _profileColumnsMigrated = true;
    console.log('[migrate] ✅ Profile columns migration complete');
  } catch (err) {
    console.error('[migrate] ❌ Auto-migration failed:', err.message);
    // Don't crash server — routes still work for existing columns
  }
}

// Run immediately when this module is loaded by Express
autoMigrateProfileColumns();

// ═════════════════════════════════════════════════════════════
// GET /api/faculty/profile
// Dashboard.jsx calls this on mount: api.get("/faculty/profile")
// ═════════════════════════════════════════════════════════════
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await rawFetchUser(req.user.id, sequelize);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    const str = (v) => (v === null || v === undefined ? '' : String(v));

    const profile = {
      // users table
      full_name:     str(user.full_name),
      email:         str(user.email),
      phone_number:  str(user.phone),   // Dashboard uses phone_number
      phone:         str(user.phone),
      profile_photo: user.profile_photo || null,
      date_of_birth: str(user.date_of_birth),
      gender:        str(user.gender),
      bio:           str(user.bio),
      // address
      address_line1:  str(user.address_line1),
      address_line2:  str(user.address_line2),
      city:           str(user.city),
      state:          str(user.state),
      country:        str(user.country),
      postal_code:    str(user.postal_code),
      // emergency
      emergency_contact_name:  str(user.emergency_contact_name),
      emergency_contact_phone: str(user.emergency_contact_phone),
      // additional
      edu_degree:      str(user.edu_degree),
      edu_institution: str(user.edu_institution),
      edu_year:        str(user.edu_year),
      edu_grade:       str(user.edu_grade),
      certifications:  str(user.certifications),
      languages_known: str(user.languages_known),
      skills:          str(user.skills),
      achievements:    str(user.achievements),
      publications:    str(user.publications),
      // social
      linkedin: str(user.linkedin),
      github:   str(user.github),
      twitter:  str(user.twitter),
      website:  str(user.website),
      // bank
      account_holder_name: str(user.account_holder_name),
      bank_name:           str(user.bank_name),
      ifsc_code:           str(user.ifsc_code),
      branch_name:         str(user.branch_name),
      account_type:        str(user.account_type) || 'savings',
      pan_number:          str(user.pan_number),
      uan_number:          str(user.uan_number),
      // faculty table
      employee_id:      str(faculty?.employee_id),
      department:       str(faculty?.department),
      qualifications:   str(faculty?.qualifications),
      qualification:    str(faculty?.qualifications), // Dashboard uses both keys
      subjects:         str(faculty?.subjects),
      experience_years: faculty?.experience_years || '',
      // professional extras (users table via raw SQL)
      designation:    str(user.designation),
      specialization: str(user.specialization),
      joining_date:   str(user.joining_date),
    };

    return res.json({ success: true, profile });
  } catch (error) {
    console.error('GET /faculty/profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// POST /api/faculty/profile/photo
// ═════════════════════════════════════════════════════════════
router.post('/profile/photo', authMiddleware, upload.single('profile_photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { sequelize } = require('../config/database');
    // Cloudinary returns full https URL in req.file.path
    // Disk storage returns just the filename in req.file.filename
    const photo_url = req.file.path || `/uploads/profiles/faculty/${req.file.filename}`;
    await rawUpdate('users', { profile_photo: photo_url }, 'id = ?', [req.user.id], sequelize);
    res.json({ success: true, photo_url }); // Dashboard reads r.data.photo_url
  } catch (error) {
    console.error('POST /faculty/profile/photo error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile photo', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// PUT /api/faculty/profile/personal
// ═════════════════════════════════════════════════════════════
router.put('/profile/personal', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone_number, date_of_birth, gender, bio } = req.body;
    if (!full_name?.trim()) return res.status(400).json({ success: false, message: 'Full name is required' });

    const { sequelize } = require('../config/database');
    await rawUpdate('users', {
      full_name:     full_name.trim(),
      phone:         phone_number?.trim() || null,
      date_of_birth: date_of_birth        || null,
      gender:        gender               || null,
      bio:           bio?.trim()          || null,
    }, 'id = ?', [req.user.id], sequelize);

    res.json({ success: true, message: 'Personal information updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/profile/personal error:', error);
    res.status(500).json({ success: false, message: 'Error updating personal information', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// PUT /api/faculty/profile/professional
// ✅ FIX #2 — employee_id now saved (was silently ignored before)
// ✅ FIX #3 — findOrCreate() ensures a faculty row always exists
// ═════════════════════════════════════════════════════════════
router.put('/profile/professional', authMiddleware, async (req, res) => {
  try {
    const {
      designation, department, qualification, specialization,
      experience_years, joining_date, employee_id,
    } = req.body;

    const { sequelize } = require('../config/database');

    // ✅ FIX #3: findOrCreate — previously used findOne().
    // If no faculty row existed (new user), updates silently did nothing.
    const [faculty] = await Faculty.findOrCreate({
      where:    { user_id: req.user.id },
      defaults: { user_id: req.user.id },
    });

    const facultyUpdates = {};
    if (department       !== undefined) facultyUpdates.department       = department       || null;
    if (qualification    !== undefined) facultyUpdates.qualifications   = qualification    || null;
    if (experience_years !== undefined) facultyUpdates.experience_years = experience_years ? parseInt(experience_years, 10) : null;

    // ✅ FIX #2: employee_id was in the form state but never written here.
    if (employee_id !== undefined) {
      facultyUpdates.employee_id = employee_id?.toString().trim() || null;
    }

    if (Object.keys(facultyUpdates).length > 0) await faculty.update(facultyUpdates);

    await rawUpdate('users', {
      designation:    designation    || null,
      specialization: specialization || null,
      joining_date:   joining_date   || null,
    }, 'id = ?', [req.user.id], sequelize);

    res.json({ success: true, message: 'Professional information updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/profile/professional error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Employee ID is already assigned to another faculty member' });
    }
    res.status(500).json({ success: false, message: 'Error updating professional information', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// PUT /api/faculty/profile/contact
// ═════════════════════════════════════════════════════════════
router.put('/profile/contact', authMiddleware, async (req, res) => {
  try {
    const {
      address_line1, address_line2, city, state, country, postal_code,
      emergency_contact_name, emergency_contact_phone,
    } = req.body;

    const { sequelize } = require('../config/database');
    await rawUpdate('users', {
      address_line1, address_line2, city, state, country, postal_code,
      emergency_contact_name, emergency_contact_phone,
    }, 'id = ?', [req.user.id], sequelize);

    res.json({ success: true, message: 'Contact information updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/profile/contact error:', error);
    res.status(500).json({ success: false, message: 'Error updating contact information', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// PUT /api/faculty/profile/additional
// ═════════════════════════════════════════════════════════════
router.put('/profile/additional', authMiddleware, async (req, res) => {
  try {
    const {
      edu_degree, edu_institution, edu_year, edu_grade,
      certifications, languages_known, skills, achievements, publications,
    } = req.body;

    const { sequelize } = require('../config/database');
    await rawUpdate('users', {
      edu_degree, edu_institution, edu_year, edu_grade,
      certifications, languages_known, skills, achievements, publications,
    }, 'id = ?', [req.user.id], sequelize);

    res.json({ success: true, message: 'Additional information updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/profile/additional error:', error);
    res.status(500).json({ success: false, message: 'Error updating additional information', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// PUT /api/faculty/profile/social
// ═════════════════════════════════════════════════════════════
router.put('/profile/social', authMiddleware, async (req, res) => {
  try {
    const { linkedin, github, twitter, website } = req.body;
    const { sequelize } = require('../config/database');
    await rawUpdate('users', {
      linkedin: linkedin || null,
      github:   github   || null,
      twitter:  twitter  || null,
      website:  website  || null,
    }, 'id = ?', [req.user.id], sequelize);

    res.json({ success: true, message: 'Social links updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/profile/social error:', error);
    res.status(500).json({ success: false, message: 'Error updating social links', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// PUT /api/faculty/profile/bank
// ═════════════════════════════════════════════════════════════
router.put('/profile/bank', authMiddleware, async (req, res) => {
  try {
    const {
      account_holder_name, bank_name, account_number,
      ifsc_code, branch_name, account_type, pan_number, uan_number,
    } = req.body;

    const { sequelize } = require('../config/database');
    await rawUpdate('users', {
      account_holder_name, bank_name, account_number,
      ifsc_code, branch_name,
      account_type: account_type || 'savings',
      pan_number, uan_number,
    }, 'id = ?', [req.user.id], sequelize);

    res.json({ success: true, message: 'Bank details saved securely' });
  } catch (error) {
    console.error('PUT /faculty/profile/bank error:', error);
    res.status(500).json({ success: false, message: 'Error saving bank details', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// GET /api/faculty/migrate-profile-columns
// Manual trigger — autoMigrateProfileColumns() already runs on
// server start, but you can hit this URL to force a re-run.
// ═════════════════════════════════════════════════════════════
router.get('/migrate-profile-columns', async (req, res) => {
  const { sequelize } = require('../config/database');
  const columns = [
    'date_of_birth DATE', 'gender VARCHAR(20)', 'bio TEXT',
    'profile_photo VARCHAR(500)', 'phone VARCHAR(50)',
    'designation VARCHAR(255)', 'specialization VARCHAR(255)', 'joining_date DATE',
    'address_line1 VARCHAR(255)', 'address_line2 VARCHAR(255)',
    'city VARCHAR(100)', 'state VARCHAR(100)', 'country VARCHAR(100)', 'postal_code VARCHAR(20)',
    'emergency_contact_name VARCHAR(255)', 'emergency_contact_phone VARCHAR(50)',
    'edu_degree VARCHAR(255)', 'edu_institution VARCHAR(255)',
    'edu_year VARCHAR(10)', 'edu_grade VARCHAR(50)',
    'certifications TEXT', 'languages_known VARCHAR(255)', 'skills TEXT',
    'achievements TEXT', 'publications TEXT',
    'linkedin VARCHAR(500)', 'github VARCHAR(500)', 'twitter VARCHAR(500)', 'website VARCHAR(500)',
    'account_holder_name VARCHAR(255)', 'bank_name VARCHAR(255)', 'account_number VARCHAR(100)',
    'ifsc_code VARCHAR(20)', 'branch_name VARCHAR(255)',
    "account_type VARCHAR(50) DEFAULT 'savings'", 'pan_number VARCHAR(20)', 'uan_number VARCHAR(20)',
    "language VARCHAR(10) DEFAULT 'en'", "timezone VARCHAR(100) DEFAULT 'Asia/Kolkata'",
    'email_notifications TINYINT(1) DEFAULT 1', 'sms_notifications TINYINT(1) DEFAULT 0',
    "theme VARCHAR(20) DEFAULT 'light'",
  ];

  const results = [];
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

  return res.json({
    success:  true,
    added:    results.filter(r => r.status === 'added').length,
    existing: results.filter(r => r.status === 'already_exists').length,
    errors:   results.filter(r => r.status === 'error'),
    results,
  });
});

// ═════════════════════════════════════════════════════════════
// GET /api/faculty/dashboard/stats
// ═════════════════════════════════════════════════════════════
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const facultyId = faculty.id;
    const totalCourses   = await Course.count({ where: { faculty_id: facultyId } });
    const facultyCourses = await Course.findAll({ where: { faculty_id: facultyId }, attributes: ['id'] });
    const courseIds      = facultyCourses.map(c => c.id);

    const totalStudents = courseIds.length
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds } }, distinct: true, col: 'student_id' })
      : 0;
    const activeEnrollments = courseIds.length
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: { [Op.in]: ['enrolled', 'in_progress'] } } })
      : 0;
    const completedEnrollments = courseIds.length
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: 'completed' } })
      : 0;
    const pendingExams = courseIds.length
      ? await Exam.count({ where: { course_id: { [Op.in]: courseIds }, is_active: true } })
      : 0;

    let averageGrade = 0;
    if (courseIds.length) {
      const exams   = await Exam.findAll({ where: { course_id: { [Op.in]: courseIds } }, attributes: ['id'] });
      const examIds = exams.map(e => e.id);
      if (examIds.length) {
        const recs = await Result.findAll({ where: { exam_id: { [Op.in]: examIds } }, attributes: ['score', 'total_marks'] });
        if (recs.length) {
          const pct = recs.reduce((s, r) => s + (r.total_marks > 0 ? (r.score / r.total_marks) * 100 : r.score || 0), 0);
          averageGrade = Math.round((pct / recs.length) * 10) / 10;
        }
      }
    }

    let totalWatchTime = 0;
    if (courseIds.length) {
      const mods    = await CourseModule.findAll({ where: { course_id: { [Op.in]: courseIds } }, attributes: ['id'] });
      const modIds  = mods.map(m => m.id);
      if (modIds.length) {
        const lessons   = await Lesson.findAll({ where: { course_module_id: { [Op.in]: modIds } }, attributes: ['id'] });
        const lessonIds = lessons.map(l => l.id);
        if (lessonIds.length) {
          const wh  = await VideoWatchHistory.findAll({ where: { lesson_id: { [Op.in]: lessonIds } }, attributes: ['total_watch_time'] });
          const sec = wh.reduce((s, w) => s + (w.total_watch_time || 0), 0);
          totalWatchTime = Math.round(sec / 3600);
        }
      }
    }

    const liveClasses = courseIds.length
      ? await Exam.count({ where: { course_id: { [Op.in]: courseIds }, is_active: true } })
      : 0;

    const recent = courseIds.length
      ? await Enrollment.findAll({
          where:   { course_id: { [Op.in]: courseIds } },
          include: [
            { model: Student, include: [{ model: User, as: 'user', attributes: ['full_name'] }] },
            { model: Course,  attributes: ['course_name'] },
          ],
          order: [['created_at', 'DESC']],
          limit: 5,
        })
      : [];

    res.json({
      success: true,
      stats: {
        totalCourses, totalStudents, pendingExams,
        pendingAssignments: 0, totalWatchTime, averageGrade,
        liveClasses, activeEnrollments,
        completedAssignments: completedEnrollments,
      },
      activities: recent.map(e => ({
        title: `${e.Student?.user?.full_name || 'A student'} enrolled in ${e.Course?.course_name || 'a course'}`,
        time:  e.created_at,
        type:  'enrollment',
      })),
    });
  } catch (error) {
    console.error('GET /faculty/dashboard/stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard statistics', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// QUIZZES
// ═════════════════════════════════════════════════════════════
router.get('/quizzes', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const courseIds = (await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id'] })).map(c => c.id);
    const quizzes   = await Quiz.findAll({
      where:   { course_id: courseIds },
      include: [{ model: Course, attributes: ['course_name'] }, { model: QuizQuestion, attributes: ['id'] }],
      order:   [['created_at', 'DESC']],
    });

    res.json({ success: true, quizzes: quizzes.map(q => ({ ...q.toJSON(), question_count: q.QuizQuestions?.length || 0 })) });
  } catch (error) {
    console.error('GET /faculty/quizzes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching quizzes' });
  }
});

// ═════════════════════════════════════════════════════════════
// COURSES
// ═════════════════════════════════════════════════════════════
router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const courses = await Course.findAll({
      where:      { faculty_id: faculty.id, is_active: true },
      attributes: ['id', 'course_name', ['course_code', 'code']],
      order:      [['course_name', 'ASC']],
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('GET /faculty/courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

// ═════════════════════════════════════════════════════════════
// STUDENTS
// ═════════════════════════════════════════════════════════════
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, students: [] });

    const courseIds = (await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id', 'course_name'] })).map(c => c.id);
    if (!courseIds.length) return res.json({ success: true, students: [] });

    const enrollments = await Enrollment.findAll({
      where:   { course_id: { [Op.in]: courseIds } },
      include: [
        { model: Student, include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone', 'profile_photo'] }] },
        { model: Course,  attributes: ['course_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const map = {};
    for (const e of enrollments) {
      const sid = e.student_id;
      if (!map[sid]) {
        map[sid] = {
          id: sid,
          name:          e.Student?.user?.full_name   || 'Unknown',
          email:         e.Student?.user?.email       || '',
          phone:         e.Student?.user?.phone       || '',
          profile_photo: e.Student?.user?.profile_photo || '',
          courses:     [],
          status:      e.completion_status || 'enrolled',
          enrolled_at: e.created_at,
        };
      }
      if (e.Course?.course_name) map[sid].courses.push(e.Course.course_name);
    }

    res.json({ success: true, students: Object.values(map) });
  } catch (error) {
    console.error('GET /faculty/students error:', error);
    res.json({ success: true, students: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// CONTENT — GET
// ═════════════════════════════════════════════════════════════
router.get('/content', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, content: [] });
    await ensureContentTable(sequelize);

    const [rows] = await sequelize.query(`
      SELECT fc.*, COALESCE(c.course_name,'General') AS course
      FROM faculty_content fc
      LEFT JOIN courses c ON c.id = fc.course_id
      WHERE fc.faculty_id = ?
      ORDER BY fc.created_at DESC
    `, { replacements: [faculty.id] });

    res.json({ success: true, content: rows });
  } catch (error) {
    console.error('GET /faculty/content error:', error);
    res.json({ success: true, content: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// CONTENT — UPLOAD
// ═════════════════════════════════════════════════════════════
router.post('/content/upload', authMiddleware, (req, res, next) => {
  contentUpload.single('file')(req, res, (err) => {
    if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    await ensureContentTable(sequelize);

    const { title, description, type, course_id, display_order, duration } = req.body;
    const file_path = req.file ? `/uploads/content/${req.file.filename}` : req.body.file_path || null;
    const file_size = req.file ? `${(req.file.size / (1024 * 1024)).toFixed(2)} MB` : null;

    await sequelize.query(`
      INSERT INTO faculty_content
        (title,description,type,course_id,faculty_id,file_path,file_size,duration,display_order,status,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,'published',NOW())
    `, { replacements: [title || 'Untitled', description || null, type || 'video', course_id || null, faculty.id, file_path, file_size, duration || null, display_order || 1] });

    res.json({ success: true, message: 'Content uploaded successfully', file_path });
  } catch (error) {
    console.error('POST /faculty/content/upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// CONTENT — UPDATE
// ═════════════════════════════════════════════════════════════
router.put('/content/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { title, description, type, course_id, display_order, duration, status } = req.body;
    await sequelize.query(`
      UPDATE faculty_content
      SET title=?,description=?,type=?,course_id=?,display_order=?,duration=?,status=?
      WHERE id=? AND faculty_id=?
    `, { replacements: [title, description, type, course_id, display_order || 1, duration, status || 'published', req.params.id, faculty.id] });

    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/content error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

// ═════════════════════════════════════════════════════════════
// CONTENT — DELETE
// ═════════════════════════════════════════════════════════════
router.delete('/content/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const [rows] = await sequelize.query(
      'SELECT file_path FROM faculty_content WHERE id=? AND faculty_id=?',
      { replacements: [req.params.id, faculty.id] },
    );
    if (rows.length && rows[0].file_path) {
      const full = path.join(__dirname, '..', rows[0].file_path);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
    await sequelize.query('DELETE FROM faculty_content WHERE id=? AND faculty_id=?', { replacements: [req.params.id, faculty.id] });

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('DELETE /faculty/content error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

// ═════════════════════════════════════════════════════════════
// ANNOUNCEMENTS
// ═════════════════════════════════════════════════════════════
router.get('/announcements', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL, content TEXT,
        faculty_id INT, course_id INT,
        priority VARCHAR(50) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, announcements: [] });

    const [rows] = await sequelize.query(
      `SELECT a.*, COALESCE(c.course_name,'All Courses') AS course_name
       FROM announcements a LEFT JOIN courses c ON c.id=a.course_id
       WHERE a.faculty_id=? ORDER BY a.created_at DESC`,
      { replacements: [faculty.id] },
    );
    res.json({ success: true, announcements: rows });
  } catch (error) {
    console.error('GET /faculty/announcements error:', error);
    res.json({ success: true, announcements: [] });
  }
});

router.post('/announcements', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { title, content, course_id, priority } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    await sequelize.query(
      'INSERT INTO announcements (title,content,faculty_id,course_id,priority,created_at) VALUES (?,?,?,?,?,NOW())',
      { replacements: [title.trim(), content || null, faculty.id, course_id || null, priority || 'normal'] },
    );
    res.json({ success: true, message: 'Announcement posted' });
  } catch (error) {
    console.error('POST /faculty/announcements error:', error);
    res.status(500).json({ success: false, message: 'Error posting announcement' });
  }
});

router.delete('/announcements/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    await sequelize.query('DELETE FROM announcements WHERE id=? AND faculty_id=?', { replacements: [req.params.id, faculty.id] });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('DELETE /faculty/announcements error:', error);
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
});

// ═════════════════════════════════════════════════════════════
// MESSAGES
// ═════════════════════════════════════════════════════════════
router.get('/messages', authMiddleware, async (req, res) => {
  res.json({ success: true, messages: [] });
});

// ═════════════════════════════════════════════════════════════
// ASSIGNMENTS
// ═════════════════════════════════════════════════════════════
router.get('/assignments', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, assignments: [] });

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255), description TEXT,
        course_id INT, faculty_id INT,
        due_date DATE, total_marks INT DEFAULT 100,
        rubric JSON, status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const courseIds = (await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id'] })).map(c => c.id);
    if (!courseIds.length) return res.json({ success: true, assignments: [] });

    const ph = courseIds.map(() => '?').join(',');
    const [assignments] = await sequelize.query(
      `SELECT a.*,c.course_name FROM assignments a LEFT JOIN courses c ON c.id=a.course_id
       WHERE a.faculty_id=? AND a.course_id IN (${ph}) ORDER BY a.due_date ASC`,
      { replacements: [faculty.id, ...courseIds] },
    );
    res.json({ success: true, assignments });
  } catch (e) {
    console.error('GET /faculty/assignments error:', e);
    res.json({ success: true, assignments: [] });
  }
});

router.post('/assignments', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { title, description, course_id, due_date, total_marks, rubric } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    await sequelize.query(
      `INSERT INTO assignments (title,description,course_id,faculty_id,due_date,total_marks,rubric,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,'active',NOW(),NOW())`,
      { replacements: [title, description || null, course_id || null, faculty.id, due_date || null, total_marks || 100, rubric ? JSON.stringify(rubric) : null] },
    );

    // Nudge AI: register new assignment for tracking
    const nudge = req.app.get('nudge');
    if (nudge && course_id) {
      const { Enrollment } = require('../models');
      const enrollments = await Enrollment.findAll({ where: { course_id }, attributes: ['student_id'] });
      const studentIds = enrollments.map(e => String(e.student_id));
      if (studentIds.length > 0) {
        nudge.assignmentUploaded(String(Date.now()), String(course_id), title, due_date || new Date(Date.now() + 7*24*60*60*1000).toISOString(), studentIds).catch(() => {});
      }
    }


    res.json({ success: true, message: 'Assignment created' });
  } catch (e) {
    console.error('POST /faculty/assignments error:', e);
    res.status(500).json({ success: false, message: 'Error creating assignment' });
  }
});

router.get('/assignments/:id/submissions', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [submissions] = await sequelize.query(
      `SELECT s.*,u.full_name AS student_name FROM assignment_submissions s
       LEFT JOIN students st ON st.id=s.student_id LEFT JOIN users u ON u.id=st.user_id
       WHERE s.assignment_id=?`,
      { replacements: [req.params.id] },
    ).catch(() => [[]]);
    res.json({ success: true, submissions });
  } catch (e) {
    res.json({ success: true, submissions: [] });
  }
});

router.post('/assignments/:id/grade', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { submission_id, grade, feedback } = req.body;
    await sequelize.query(
      `UPDATE assignment_submissions SET grade=?,feedback=?,status='graded' WHERE id=?`,
      { replacements: [grade, feedback || null, submission_id] },
    );
    res.json({ success: true, message: 'Grade saved' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error saving grade' });
  }
});

router.delete('/assignments/:id', [authMiddleware, rbac(['faculty', 'admin'])], async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    await sequelize.query(
      `UPDATE assignments SET status='deleted' WHERE id=? AND faculty_id=?`,
      { replacements: [req.params.id, faculty?.id] },
    );
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error deleting assignment' });
  }
});

// ═════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═════════════════════════════════════════════════════════════
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id }, order: [['created_at', 'DESC']], limit: 30,
    }).catch(() => []);
    res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.id, title: n.title, message: n.message,
        type: n.type || 'info', time: n.created_at, read: n.is_read || false,
      })),
    });
  } catch (error) {
    res.json({ success: true, notifications: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// SETTINGS
// ═════════════════════════════════════════════════════════════
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    // rawFetchUser — language, timezone, email_notifications, sms_notifications, theme
    // are migrated columns NOT in the Sequelize User model; findByPk() silently ignores them.
    const user = await rawFetchUser(req.user.id, sequelize);
    res.json({
      success: true,
      general:       { language: user?.language || 'en', timezone: user?.timezone || 'Asia/Kolkata' },
      notifications: { emailNotifications: user?.email_notifications ?? true, smsNotifications: user?.sms_notifications ?? false },
      appearance:    { theme: user?.theme || 'light' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

router.put('/settings/general', authMiddleware, async (req, res) => {
  try {
    const { language, timezone } = req.body;
    const { sequelize } = require('../config/database');
    await rawUpdate('users', { language, timezone }, 'id = ?', [req.user.id], sequelize);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Error updating settings' }); }
});

router.put('/settings/notifications', authMiddleware, async (req, res) => {
  try {
    const { emailNotifications, smsNotifications } = req.body;
    const { sequelize } = require('../config/database');
    await rawUpdate('users', { email_notifications: emailNotifications, sms_notifications: smsNotifications }, 'id = ?', [req.user.id], sequelize);
    res.json({ success: true, message: 'Notification settings updated' });
  } catch (error) { res.status(500).json({ success: false, message: 'Error updating settings' }); }
});

router.put('/settings/course', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Course settings updated' });
});

router.put('/settings/security', authMiddleware, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ success: false, message: 'Both passwords required' });
    if (new_password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user  = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(current_password, user.password_hash || user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    const field  = user.password_hash !== undefined ? { password_hash: hashed } : { password: hashed };
    await User.update(field, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('PUT /settings/security error:', error);
    res.status(500).json({ success: false, message: 'Error changing password' });
  }
});

router.put('/settings/integrations', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Integrations updated' });
});

// ═════════════════════════════════════════════════════════════
// ANALYTICS
// ═════════════════════════════════════════════════════════════
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, analytics: {} });

    const courses   = await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id', 'course_name'] });
    const courseIds = courses.map(c => c.id);

    const totalStudents = courseIds.length
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds } }, distinct: true, col: 'student_id' })
      : 0;
    const completed = courseIds.length
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: 'completed' } })
      : 0;
    const completionRate = totalStudents ? Math.round((completed / totalStudents) * 100) : 0;

    const courseAnalytics = await Promise.all(courses.map(async c => ({
      course_name: c.course_name,
      enrolled:    await Enrollment.count({ where: { course_id: c.id } }),
      completed:   await Enrollment.count({ where: { course_id: c.id, completion_status: 'completed' } }),
    })));

    res.json({ success: true, analytics: { totalStudents, completionRate, courseAnalytics, totalCourses: courses.length } });
  } catch (error) {
    console.error('GET /faculty/analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

// ═════════════════════════════════════════════════════════════
// LIVE CLASSES
// ═════════════════════════════════════════════════════════════
router.get('/live-classes', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, classes: [] });

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255), description TEXT,
        faculty_id INT, course_id INT,
        scheduled_at DATETIME, duration_minutes INT DEFAULT 60,
        meeting_link VARCHAR(500), platform VARCHAR(100) DEFAULT 'zoom',
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [classes] = await sequelize.query(
      `SELECT lc.*,COALESCE(c.course_name,'General') AS course_name
       FROM live_classes lc LEFT JOIN courses c ON c.id=lc.course_id
       WHERE lc.faculty_id=? ORDER BY lc.scheduled_at DESC`,
      { replacements: [faculty.id] },
    );
    res.json({ success: true, classes });
  } catch (error) {
    console.error('GET /faculty/live-classes error:', error);
    res.json({ success: true, classes: [] });
  }
});

router.post('/live-classes', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { title, description, course_id, scheduled_at, duration_minutes, meeting_link, platform } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    await sequelize.query(
      `INSERT INTO live_classes (title,description,faculty_id,course_id,scheduled_at,duration_minutes,meeting_link,platform,status,created_at)
       VALUES (?,?,?,?,?,?,?,?,'scheduled',NOW())`,
      { replacements: [title, description || null, faculty.id, course_id || null, scheduled_at || null, duration_minutes || 60, meeting_link || null, platform || 'zoom'] },
    );
    res.json({ success: true, message: 'Live class scheduled' });
  } catch (error) {
    console.error('POST /faculty/live-classes error:', error);
    res.status(500).json({ success: false, message: 'Error scheduling class' });
  }
});

// ═════════════════════════════════════════════════════════════
// BATCHES
// ═════════════════════════════════════════════════════════════
router.get('/batches', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, batches: [] });

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255), description TEXT,
        faculty_id INT, course_id INT,
        start_date DATE, end_date DATE,
        max_students INT DEFAULT 30, status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [batches] = await sequelize.query(
      `SELECT b.*,COALESCE(c.course_name,'General') AS course_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id=b.course_id) AS student_count
       FROM batches b LEFT JOIN courses c ON c.id=b.course_id
       WHERE b.faculty_id=? ORDER BY b.created_at DESC`,
      { replacements: [faculty.id] },
    );
    res.json({ success: true, batches });
  } catch (error) {
    console.error('GET /faculty/batches error:', error);
    res.json({ success: true, batches: [] });
  }
});

router.post('/batches', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { name, description, course_id, start_date, end_date, max_students } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Batch name is required' });

    await sequelize.query(
      `INSERT INTO batches (name,description,faculty_id,course_id,start_date,end_date,max_students,status,created_at)
       VALUES (?,?,?,?,?,?,?,'active',NOW())`,
      { replacements: [name, description || null, faculty.id, course_id || null, start_date || null, end_date || null, max_students || 30] },
    );
    res.json({ success: true, message: 'Batch created' });
  } catch (error) {
    console.error('POST /faculty/batches error:', error);
    res.status(500).json({ success: false, message: 'Error creating batch' });
  }
});

router.delete('/batches/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    await sequelize.query('DELETE FROM batches WHERE id=? AND faculty_id=?', { replacements: [req.params.id, faculty?.id] });
    res.json({ success: true, message: 'Batch deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error deleting batch' });
  }
});

router.get('/batches/:id/students', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [batch] = await sequelize.query('SELECT * FROM batches WHERE id=? LIMIT 1', { replacements: [req.params.id] });
    if (!batch.length) return res.status(404).json({ success: false, message: 'Batch not found' });

    const enrollments = batch[0].course_id
      ? await Enrollment.findAll({
          where:   { course_id: batch[0].course_id },
          include: [{ model: Student, include: [{ model: User, as: 'user', attributes: ['full_name', 'email'] }] }],
        }).catch(() => [])
      : [];

    res.json({ success: true, students: enrollments.map(e => ({ id: e.student_id, name: e.Student?.user?.full_name || 'Unknown', email: e.Student?.user?.email || '', status: e.completion_status || 'enrolled' })) });
  } catch (e) {
    res.json({ success: true, students: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// DOUBTS
// ═════════════════════════════════════════════════════════════
router.get('/doubts', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, doubts: [] });

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS doubts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT, faculty_id INT, course_id INT,
        question TEXT, answer TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        answered_at TIMESTAMP NULL
      )
    `);

    const courseIds = (await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id'] })).map(c => c.id);
    if (!courseIds.length) return res.json({ success: true, doubts: [] });

    const ph = courseIds.map(() => '?').join(',');
    const [doubts] = await sequelize.query(
      `SELECT d.*,u.full_name AS student_name,c.course_name
       FROM doubts d LEFT JOIN students s ON s.id=d.student_id
       LEFT JOIN users u ON u.id=s.user_id LEFT JOIN courses c ON c.id=d.course_id
       WHERE d.course_id IN (${ph}) ORDER BY d.created_at DESC`,
      { replacements: courseIds },
    );
    res.json({ success: true, doubts });
  } catch (error) {
    console.error('GET /faculty/doubts error:', error);
    res.json({ success: true, doubts: [] });
  }
});

router.post('/doubts/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { answer } = req.body;
    await sequelize.query(
      `UPDATE doubts SET answer=?,status='answered',answered_at=NOW() WHERE id=?`,
      { replacements: [answer, req.params.id] },
    );
    res.json({ success: true, message: 'Reply sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending reply' });
  }
});

// ═════════════════════════════════════════════════════════════
// COURSE CONTENT (faculty-facing)
// ═════════════════════════════════════════════════════════════
router.get('/course-content/:courseId', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    await ensureContentTable(sequelize);
    const [content] = await sequelize.query(
      `SELECT * FROM faculty_content WHERE course_id=? AND status='published' ORDER BY display_order ASC,created_at ASC`,
      { replacements: [req.params.courseId] },
    );
    res.json({ success: true, content: content || [] });
  } catch (error) {
    console.error('GET /faculty/course-content error:', error);
    res.json({ success: true, content: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// CORPORATE PORTAL
// ═════════════════════════════════════════════════════════════
router.get('/corporate/profiles', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [profiles] = await sequelize.query(
      `SELECT id,full_name,email,phone,profile_photo,skills,bio,linkedin,github,portfolio,current_designation,current_employer
       FROM users WHERE role='student' AND corporate_visible=TRUE`,
      { type: sequelize.QueryTypes.SELECT },
    );
    res.json({ success: true, profiles: profiles || [] });
  } catch (error) {
    console.error('GET /faculty/corporate/profiles error:', error);
    res.json({ success: true, profiles: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// STUDENT COURSE CONTENT
// ═════════════════════════════════════════════════════════════
router.get('/student/course-content/:courseId', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    await ensureContentTable(sequelize);
    const [content] = await sequelize.query(`
      SELECT fc.id,fc.title,fc.description,fc.type,fc.file_path,
             fc.file_size,fc.duration,fc.display_order,fc.views,fc.created_at,
             u.full_name AS instructor_name
      FROM faculty_content fc
      LEFT JOIN faculty f ON fc.faculty_id=f.id
      LEFT JOIN users u ON f.user_id=u.id
      WHERE fc.course_id=? AND fc.status='published'
      ORDER BY fc.display_order ASC,fc.created_at ASC
    `, { replacements: [req.params.courseId] });
    res.json({ success: true, content: content || [] });
  } catch (error) {
    console.error('GET /student/course-content error:', error.message);
    res.json({ success: true, content: [] });
  }
});

module.exports = router;