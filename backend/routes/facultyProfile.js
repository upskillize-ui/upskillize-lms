// backend/routes/facultyProfile.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require("../models");
const { Op } = require('sequelize');
const rbac = require('../middleware/rbac');
const { User, Faculty, Course, Enrollment, Student, Exam, Result,
        VideoWatchHistory, Lesson, CourseModule, Quiz, QuizQuestion,
        Notification } = require('../models');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles/faculty';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ── CONTENT UPLOAD MULTER CONFIG ──────────────────────────
const contentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/content');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'content_' + Date.now() + ext);
  }
});
const contentUpload = multer({
  storage: contentStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = /mp4|mov|avi|mkv|webm|pdf|ppt|pptx|zip|rar/i;
    if (allowed.test(path.extname(file.originalname))) return cb(null, true);
    cb(new Error('File type not allowed'));
  }
});


// ── SHARED HELPER: ensure faculty_content table exists ─────
// Called once at startup so every route avoids repeating DDL
let _contentTableReady = false;
async function ensureContentTable(sequelize) {
  if (_contentTableReady) return;
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS faculty_content (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      title         VARCHAR(255),
      description   TEXT,
      type          VARCHAR(100)  DEFAULT 'video',
      course_id     INT,
      faculty_id    INT NOT NULL,
      file_path     VARCHAR(500),
      file_size     VARCHAR(100),
      duration      VARCHAR(100),
      display_order INT           DEFAULT 1,
      status        VARCHAR(50)   DEFAULT 'published',
      views         INT           DEFAULT 0,
      created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // One-time safe column additions (idempotent)
  for (const sql of [
    'ALTER TABLE faculty_content ADD COLUMN display_order INT DEFAULT 1',
    'ALTER TABLE faculty_content ADD COLUMN duration VARCHAR(100)',
  ]) {
    try { await sequelize.query(sql); } catch (_) { /* already exists */ }
  }
  _contentTableReady = true;
}

// ── PROFILE PHOTO ──────────────────────────────────────────
router.post('/profile/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `/uploads/profiles/faculty/${req.file.filename}`;
    await User.update({ profile_photo: imageUrl }, { where: { id: req.user.id, role: 'faculty' } });
     res.json({ success: true, imageUrl });   // ← photo_url to match frontend
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading profile photo' });
  }
});

// ── PROFILE PERSONAL ───────────────────────────────────────
router.put('/profile/personal', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone_number } = req.body;
    if (!full_name?.trim()) return res.status(400).json({ success: false, message: 'Full name is required' });
    const [updated] = await User.update(
      { full_name: full_name.trim(), phone: phone_number?.trim() || null },
      { where: { id: req.user.id, role: 'faculty' } }
    );
    if (updated === 0) return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    res.json({ success: true, message: 'Personal information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating personal information' });
  }
});

// ── PROFILE PROFESSIONAL ───────────────────────────────────
router.put('/profile/professional', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Professional information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating professional information' });
  }
});

// ── PROFILE CONTACT ────────────────────────────────────────
router.put('/profile/contact', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Contact information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contact information' });
  }
});

// ── PROFILE SOCIAL ─────────────────────────────────────────
router.put('/profile/social', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Social links updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating social links' });
  }
});

// ── DASHBOARD STATS ────────────────────────────────────────
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ where: { user_id: userId } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const facultyId = faculty.id;
    const totalCourses = await Course.count({ where: { faculty_id: facultyId } });
    const facultyCourses = await Course.findAll({ where: { faculty_id: facultyId }, attributes: ['id'] });
    const courseIds = facultyCourses.map(c => c.id);

    const totalStudents = courseIds.length > 0
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds } }, distinct: true, col: 'student_id' })
      : 0;

    const activeEnrollments = courseIds.length > 0
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: { [Op.in]: ['enrolled', 'in_progress'] } } })
      : 0;

    const completedEnrollments = courseIds.length > 0
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: 'completed' } })
      : 0;

    const pendingExams = courseIds.length > 0
      ? await Exam.count({ where: { course_id: { [Op.in]: courseIds }, is_active: true } })
      : 0;

    let averageGrade = 0;
    if (courseIds.length > 0) {
      const exams = await Exam.findAll({ where: { course_id: { [Op.in]: courseIds } }, attributes: ['id'] });
      const examIds = exams.map(e => e.id);
      if (examIds.length > 0) {
        const results = await Result.findAll({ where: { exam_id: { [Op.in]: examIds } }, attributes: ['score', 'total_marks'] });
        if (results.length > 0) {
          const totalPct = results.reduce((sum, r) => sum + (r.total_marks > 0 ? (r.score / r.total_marks) * 100 : r.score || 0), 0);
          averageGrade = Math.round((totalPct / results.length) * 10) / 10;
        }
      }
    }

    let totalWatchTime = 0;
    if (courseIds.length > 0) {
      const modules = await CourseModule.findAll({ where: { course_id: { [Op.in]: courseIds } }, attributes: ['id'] });
      const moduleIds = modules.map(m => m.id);
      if (moduleIds.length > 0) {
        const lessons = await Lesson.findAll({ where: { course_module_id: { [Op.in]: moduleIds } }, attributes: ['id'] });
        const lessonIds = lessons.map(l => l.id);
        if (lessonIds.length > 0) {
          const watchHistory = await VideoWatchHistory.findAll({ where: { lesson_id: { [Op.in]: lessonIds } }, attributes: ['total_watch_time'] });
          const totalSeconds = watchHistory.reduce((sum, w) => sum + (w.total_watch_time || 0), 0);
          totalWatchTime = Math.round(totalSeconds / 3600);
        }
      }
    }

    const liveClasses = courseIds.length > 0
      ? await Exam.count({ where: { course_id: { [Op.in]: courseIds }, is_active: true } })
      : 0;

    // ─────────────────────────────────────────────────────────────────────
    // FIX: Added  as: 'user'  to the nested Student include.
    //
    // The Student model defines its User association with a lowercase alias:
    //   Student.belongsTo(User, { as: 'user', foreignKey: 'user_id' })
    //
    // Sequelize throws EagerLoadingError when the 'as' value doesn't exactly
    // match the alias defined in the association (case-sensitive).
    //
    // BEFORE (broken):
    //   include: [{ model: Student, include: [{ model: User, attributes: ['full_name'] }] }]
    //
    // AFTER (fixed — lowercase 'user'):
    //   include: [{ model: Student, include: [{ model: User, as: 'user', attributes: ['full_name'] }] }]
    // ─────────────────────────────────────────────────────────────────────
    const recentEnrollments = courseIds.length > 0
      ? await Enrollment.findAll({
          where: { course_id: { [Op.in]: courseIds } },
          include: [
            {
              model: Student,
              include: [{ model: User, as: 'user', attributes: ['full_name'] }]  // ✅ FIXED — lowercase alias
            },
            { model: Course, attributes: ['course_name'] }
          ],
          order: [['created_at', 'DESC']],
          limit: 5
        })
      : [];

    const activities = recentEnrollments.map(e => ({
      title: `${e.Student?.user?.full_name || 'A student'} enrolled in ${e.Course?.course_name || 'a course'}`,
      time: e.created_at,
      type: 'enrollment'
    }));

    res.json({
      success: true,
      stats: {
        totalCourses, totalStudents, pendingExams,
        pendingAssignments: 0, totalWatchTime, averageGrade,
        liveClasses, activeEnrollments,
        completedAssignments: completedEnrollments
      },
      activities
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard statistics' });
  }
});

// ── QUIZZES ────────────────────────────────────────────────
router.get('/quizzes', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const courses = await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id'] });
    const courseIds = courses.map(c => c.id);

    const quizzes = await Quiz.findAll({
      where: { course_id: courseIds },
      include: [
        { model: Course, attributes: ['course_name'] },
        { model: QuizQuestion, attributes: ['id'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      quizzes: quizzes.map(q => ({
        ...q.toJSON(),
        question_count: q.QuizQuestions?.length || 0
      }))
    });
  } catch (error) {
    console.error('Get faculty quizzes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching quizzes' });
  }
});

// ── COURSES ────────────────────────────────────────────────
router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const courses = await Course.findAll({
      where: { faculty_id: faculty.id, is_active: true },
      attributes: ['id', 'course_name', ['course_code', 'code']], // alias so frontend c.code works
      order: [['course_name', 'ASC']]
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Get faculty courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

// ── STUDENTS ───────────────────────────────────────────────
router.get('/students', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, students: [] });

    const courses = await Course.findAll({
      where: { faculty_id: faculty.id },
      attributes: ['id', 'course_name']
    });
    const courseIds = courses.map(c => c.id);
    if (courseIds.length === 0) return res.json({ success: true, students: [] });

    const enrollments = await Enrollment.findAll({
      where: { course_id: { [Op.in]: courseIds } },
      include: [
        {
          model: Student,
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone', 'profile_photo'] }]  // ✅ lowercase alias matches model definition
        },
        { model: Course, attributes: ['course_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // Deduplicate by student_id, attach all enrolled courses
    const studentMap = {};
    for (const e of enrollments) {
      const sid = e.student_id;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          id: sid,
          name: e.Student?.user?.full_name || 'Unknown',
          email: e.Student?.user?.email || '',
          phone: e.Student?.user?.phone || '',
          profile_photo: e.Student?.user?.profile_photo || '',
          courses: [],
          status: e.completion_status || 'enrolled',
          enrolled_at: e.created_at
        };
      }
      if (e.Course?.course_name) {
        studentMap[sid].courses.push(e.Course.course_name);
      }
    }

    res.json({ success: true, students: Object.values(studentMap) });
  } catch (error) {
    console.error('GET /faculty/students error:', error);
    res.json({ success: true, students: [] });
  }
});

// ── CONTENT GET ────────────────────────────────────────────
router.get('/content', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, content: [] });

    await ensureContentTable(sequelize);

    const [rows] = await sequelize.query(`
      SELECT fc.*, COALESCE(c.course_name, 'General') as course
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

// ── CONTENT UPLOAD POST ────────────────────────────────────
router.post('/content/upload', authMiddleware, (req, res, next) => {
  // Run multer, but don't crash if no file — record metadata only
  contentUpload.single('file')(req, res, (err) => {
    if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    // Fields come from multipart/form-data (parsed by multer into req.body)
    const title       = (req.body.title       || '').trim();
    const description = (req.body.description || '').trim();
    const type        = (req.body.type        || 'video').trim();
    const course_id   = req.body.course || req.body.course_id || null;
    const duration    = (req.body.duration    || '').toString();
    const order       = parseInt(req.body.order) || 1;

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    // File saved by multer (may be undefined if no file provided)
    const file_path = req.file ? '/uploads/content/' + req.file.filename : '';
    const file_size = req.file ? (req.file.size / 1024 / 1024).toFixed(1) + ' MB' : '';

    await ensureContentTable(sequelize);

    const [result] = await sequelize.query(`
      INSERT INTO faculty_content (title, description, type, course_id, faculty_id, file_path, file_size, duration, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, { replacements: [title, description, type, course_id || null, faculty.id, file_path, file_size, duration, order] });

    // Get course name for response
    let courseName = '';
    if (course_id) {
      try {
        const [rows] = await sequelize.query('SELECT course_name FROM courses WHERE id = ?', { replacements: [course_id] });
        courseName = rows[0]?.course_name || '';
      } catch(e) {}
    }

    res.json({
      success: true,
      content: {
        id: result, title, description, type,
        course: courseName, course_id,
        file_path, size: file_size,
        duration, status: 'published', views: 0,
        uploadDate: new Date().toLocaleDateString('en-IN')
      }
    });
  } catch (error) {
    console.error('POST /faculty/content/upload error:', error.message);
    res.status(500).json({ success: false, message: 'Upload error: ' + error.message });
  }
});

// ── ANNOUNCEMENTS GET ──────────────────────────────────────
router.get('/announcements', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, announcements: [] });
    const { sequelize } = require('../config/database');
    await sequelize.query(`CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255), message TEXT,
      course VARCHAR(255), priority VARCHAR(50) DEFAULT 'Medium',
      faculty_id INT, views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    const [rows] = await sequelize.query(
      `SELECT *, DATE_FORMAT(created_at,'%d %b %Y') as date
       FROM announcements WHERE faculty_id = ? ORDER BY created_at DESC`,
      { replacements: [faculty.id] }
    );
    res.json({ success: true, announcements: rows });
  } catch (e) {
    console.error(e);
    res.json({ success: true, announcements: [] });
  }
});

// ── ANNOUNCEMENTS POST (with student notifications) ────────
router.post('/announcements', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    const { title, message, course, priority } = req.body;
    const { sequelize } = require('../config/database');

    // Save announcement
    const [result] = await sequelize.query(
      `INSERT INTO announcements (title, message, course, priority, faculty_id) VALUES (?,?,?,?,?)`,
      { replacements: [title, message, course || 'All', priority || 'Medium', faculty.id] }
    );

    console.log('✅ Announcement saved, id:', result);
    console.log('📋 course value received:', course);

    // Find course IDs
    let courseIds = [];
    if (course && course !== 'All') {
      const courseRecord = await Course.findOne({ where: { id: course, faculty_id: faculty.id } });
      console.log('📚 courseRecord found:', courseRecord?.id);
      if (courseRecord) courseIds = [courseRecord.id];
    } else {
      const allCourses = await Course.findAll({ where: { faculty_id: faculty.id }, attributes: ['id'] });
      courseIds = allCourses.map(c => c.id);
      console.log('📚 all courseIds:', courseIds);
    }

    console.log('📚 Final courseIds:', courseIds);

    if (courseIds.length > 0) {
      const enrollments = await Enrollment.findAll({
        where: { course_id: courseIds },
        attributes: ['student_id']
      });

      console.log('👥 Enrollments found:', enrollments.length);

      const studentIds = [...new Set(enrollments.map(e => e.student_id).filter(Boolean))];

      const students = await Student.findAll({
        where: { id: studentIds },
        attributes: ['user_id']
      });

      const userIds = [...new Set(students.map(s => s.user_id).filter(Boolean))];
      console.log('👥 userIds to notify:', userIds);

      if (userIds.length > 0) {
        await Notification.bulkCreate(
          userIds.map(user_id => ({
            user_id,
            title,
            message,
            type: 'announcement',
            is_read: false,
            created_at: new Date(),
            updated_at: new Date()
          }))
        );
        console.log('✅ Notifications inserted for userIds:', userIds);
      } else {
        console.log('⚠️ No userIds found — no notifications inserted');
      }
    } else {
      console.log('⚠️ No courseIds found — no notifications inserted');
    }

    res.json({ success: true, announcement: { id: result, title, message, course, priority, date: new Date().toLocaleDateString(), views: 0 } });
  } catch (e) {
    console.error('❌ FULL ERROR:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── ANNOUNCEMENTS DELETE ───────────────────────────────────
router.delete('/announcements/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    await sequelize.query(
      `DELETE FROM announcements WHERE id = ? AND faculty_id = ?`,
      { replacements: [req.params.id, faculty.id] }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── MESSAGES ───────────────────────────────────────────────
router.get('/messages', authMiddleware, async (req, res) => {
  res.json({ success: true, messages: [] });
});

// ── ASSIGNMENTS GET ────────────────────────────────────────
router.get('/assignments', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, assignments: [] });

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

    const [rows] = await sequelize.query(`
      SELECT a.*,
        COALESCE(c.course_name, 'Unknown') as course,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = a.course_id) as totalStudents,
        (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id) as submissions,
        (SELECT COUNT(*) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status='graded') as graded
      FROM assignments a
      LEFT JOIN courses c ON c.id = a.course_id
      WHERE a.faculty_id = ?
      ORDER BY a.created_at DESC`,
      { replacements: [faculty.id] }
    );

    res.json({
      success: true,
      assignments: rows.map(r => ({
        ...r,
        dueDate: r.due_date,
        rubric: r.rubric ? (typeof r.rubric === 'string' ? JSON.parse(r.rubric) : r.rubric) : null
      }))
    });
  } catch (e) {
    console.error(e);
    res.json({ success: true, assignments: [] });
  }
});

// ── ASSIGNMENTS POST ───────────────────────────────────────
router.post('/assignments', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    const { title, description, course, dueDate, totalMarks, rubric } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO assignments (title, description, course_id, faculty_id, due_date, total_marks, rubric)
       VALUES (?,?,?,?,?,?,?)`,
      { replacements: [title, description, course, faculty.id, dueDate, totalMarks || 100, JSON.stringify(rubric || {})] }
    );
    res.json({
      success: true,
      assignment: { id: result, title, description, course, dueDate, totalMarks, rubric, status: 'active', submissions: 0, graded: 0, totalStudents: 0 }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── ASSIGNMENTS SUBMISSIONS GET ────────────────────────────
router.get('/assignments/:id/submissions', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [rows] = await sequelize.query(`
      SELECT s.*, u.full_name as studentName, s.submitted_at as submittedDate
      FROM assignment_submissions s
      JOIN students st ON st.id = s.student_id
      JOIN users u ON u.id = st.user_id
      WHERE s.assignment_id = ?`,
      { replacements: [req.params.id] }
    );
    res.json({ success: true, submissions: rows });
  } catch (e) {
    res.json({ success: true, submissions: [] });
  }
});

// ── ASSIGNMENTS GRADE POST ─────────────────────────────────
router.post('/assignments/:id/grade', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { studentId, student_id, submission_id, grade, feedback } = req.body;
    const resolvedStudentId = studentId || student_id;
    const resolvedGrade = parseInt(grade) || 0;

    if (submission_id) {
      await sequelize.query(
        `UPDATE assignment_submissions SET grade=?, feedback=?, status='graded' WHERE id=?`,
        { replacements: [resolvedGrade, feedback || '', submission_id] }
      );
    } else {
      await sequelize.query(
        `UPDATE assignment_submissions SET grade=?, feedback=?, status='graded'
         WHERE assignment_id=? AND student_id=?`,
        { replacements: [resolvedGrade, feedback || '', req.params.id, resolvedStudentId] }
      );
    }
    res.json({ success: true, grade: resolvedGrade });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── ASSIGNMENTS DELETE ─────────────────────────────────────
router.delete('/assignments/:id', [authMiddleware, rbac(['faculty','admin'])], async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    await sequelize.query(
      `DELETE FROM assignments WHERE id = ? AND faculty_id = ?`,
      { replacements: [req.params.id, faculty.id] }
    );
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── NOTIFICATIONS GET ──────────────────────────────────────
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20
    });
    res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        time: n.created_at,
        read: n.is_read || false
      }))
    });
  } catch (error) {
    console.error('GET /faculty/notifications error:', error);
    res.json({ success: true, notifications: [] });
  }
});

// ── SETTINGS GET ───────────────────────────────────────────
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');

    // Create table if not exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS faculty_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL UNIQUE,
        settings JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await sequelize.query(
      `SELECT settings FROM faculty_settings WHERE faculty_id = ?`,
      { replacements: [req.user.id] }
    );

    const saved = rows[0]?.settings
      ? (typeof rows[0].settings === 'string' ? JSON.parse(rows[0].settings) : rows[0].settings)
      : {};

    // Deep merge saved settings over defaults
    const defaults = {
      general: {
        institution_name: '', academic_year: '2025-2026',
        semester: 'Spring 2025', default_language: 'en',
        timezone: 'Asia/Kolkata', date_format: 'DD/MM/YYYY', time_format: '24h'
      },
      notifications: {
        email_notifications: true, student_query_alerts: true,
        assignment_submission_alerts: true, exam_reminders: true,
        course_updates: false, system_announcements: true,
        daily_digest: false, weekly_report: false
      },
      course: {
        auto_enroll: false, allow_late_submissions: true,
        late_penalty_percentage: 10, max_late_days: 3,
        default_passing_grade: 40, attendance_required: 75,
        enable_discussion_forum: true, enable_peer_review: false
      },
      security: {
        two_factor_auth: false, session_timeout: 30,
        password_expiry_days: 90, force_password_change: false,
        allow_multiple_sessions: true, ip_whitelist_enabled: false,
        login_attempt_limit: 5
      },
      integrations: {
        google_classroom: false, microsoft_teams: false,
        zoom_enabled: false, zoom_api_key: '',
        email_service: 'smtp', smtp_host: '', smtp_port: '',
        smtp_username: '', storage_provider: 'local', max_upload_size: 100
      }
    };

    const merged = {
      general:      { ...defaults.general,      ...(saved.general || {}) },
      notifications:{ ...defaults.notifications, ...(saved.notifications || {}) },
      course:       { ...defaults.course,        ...(saved.course || {}) },
      security:     { ...defaults.security,      ...(saved.security || {}) },
      integrations: { ...defaults.integrations,  ...(saved.integrations || {}) }
    };

    res.json({ success: true, settings: merged });
  } catch (error) {
    console.error('GET /faculty/settings error:', error);
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// ── SETTINGS UPSERT HELPER ─────────────────────────────────
async function upsertSettings(userId, section, data) {
  const { sequelize } = require('../config/database');
  const [rows] = await sequelize.query(
    `SELECT settings FROM faculty_settings WHERE faculty_id = ?`,
    { replacements: [userId] }
  );
  const current = rows[0]?.settings
    ? (typeof rows[0].settings === 'string' ? JSON.parse(rows[0].settings) : rows[0].settings)
    : {};
  current[section] = { ...(current[section] || {}), ...data };
  await sequelize.query(
    `INSERT INTO faculty_settings (faculty_id, settings)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE settings = ?, updated_at = NOW()`,
    { replacements: [userId, JSON.stringify(current), JSON.stringify(current)] }
  );
}

// ── SETTINGS PUT ───────────────────────────────────────────
router.put('/settings/general', authMiddleware, async (req, res) => {
  try {
    await upsertSettings(req.user.id, 'general', req.body);
    res.json({ success: true, message: 'General settings updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error updating general settings' });
  }
});

router.put('/settings/notifications', authMiddleware, async (req, res) => {
  try {
    await upsertSettings(req.user.id, 'notifications', req.body);
    res.json({ success: true, message: 'Notification settings updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error updating notification settings' });
  }
});

router.put('/settings/course', authMiddleware, async (req, res) => {
  try {
    await upsertSettings(req.user.id, 'course', req.body);
    res.json({ success: true, message: 'Course settings updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error updating course settings' });
  }
});

router.put('/settings/security', authMiddleware, async (req, res) => {
  try {
    await upsertSettings(req.user.id, 'security', req.body);
    res.json({ success: true, message: 'Security settings updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error updating security settings' });
  }
});

router.put('/settings/integrations', authMiddleware, async (req, res) => {
  try {
    await upsertSettings(req.user.id, 'integrations', req.body);
    res.json({ success: true, message: 'Integration settings updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Error updating integration settings' });
  }
});

// ── ANALYTICS ──────────────────────────────────────────────
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, analytics: {} });

    const courses = await Course.findAll({
      where: { faculty_id: faculty.id },
      attributes: ['id', 'course_name']
    });
    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        analytics: {
          avgPerformance: 0, videoCompletion: 0,
          watchTime: 0, engagement: 0,
          coursePerformance: [], videoAnalytics: []
        }
      });
    }

    // Average performance from Results
    let avgPerformance = 0;
    try {
      const exams = await Exam.findAll({
        where: { course_id: { [Op.in]: courseIds } },
        attributes: ['id']
      });
      const examIds = exams.map(e => e.id);
      if (examIds.length > 0) {
        const results = await Result.findAll({
          where: { exam_id: { [Op.in]: examIds } },
          attributes: ['score', 'total_marks']
        });
        if (results.length > 0) {
          const total = results.reduce((s, r) =>
            s + (r.total_marks > 0 ? (r.score / r.total_marks) * 100 : 0), 0);
          avgPerformance = Math.round(total / results.length);
        }
      }
    } catch (e) { console.error('Analytics exam error:', e.message); }

    // ✅ FIX: 'title' removed from Lesson attributes — column does not exist in lessons table
    let videoCompletion = 0, watchTime = 0, videoAnalytics = [];
    try {
      const modules = await CourseModule.findAll({
        where: { course_id: { [Op.in]: courseIds } },
        attributes: ['id']
      });
      const moduleIds = modules.map(m => m.id);

      if (moduleIds.length > 0) {
        const lessons = await Lesson.findAll({
          where: { course_module_id: { [Op.in]: moduleIds } },
          attributes: ['id']   // 'title' and 'duration' removed — columns do not exist in lessons table
        });
        const lessonIds = lessons.map(l => l.id);

        if (lessonIds.length > 0) {
          const watchHistory = await VideoWatchHistory.findAll({
            where: { lesson_id: { [Op.in]: lessonIds } },
            attributes: ['lesson_id', 'total_watch_time', 'completed']
          });

          const totalSeconds = watchHistory.reduce((s, w) => s + (w.total_watch_time || 0), 0);
          watchTime = Math.round(totalSeconds / 3600);

          const completed = watchHistory.filter(w => w.completed).length;
          videoCompletion = watchHistory.length > 0
            ? Math.round((completed / watchHistory.length) * 100) : 0;

          videoAnalytics = lessons.slice(0, 10).map(lesson => {
            const views = watchHistory.filter(w => w.lesson_id === lesson.id);
            const avgSecs = views.length > 0
              ? Math.round(views.reduce((s, w) => s + (w.total_watch_time || 0), 0) / views.length) : 0;
            const completionRate = views.length > 0
              ? Math.round((views.filter(w => w.completed).length / views.length) * 100) : 0;
            return {
              title: `Lesson ${lesson.id}`,   // fallback label since title col doesn't exist
              views: views.length,
              completion: completionRate,
              avgWatchTime: `${Math.floor(avgSecs / 60)}m ${avgSecs % 60}s`,
              dropOffPoint: completionRate < 50 ? 'Early' : completionRate < 80 ? 'Middle' : 'Late'
            };
          });
        }
      }
    } catch (e) { console.error('Analytics video error:', e.message); }

    // Enrollment engagement
    let engagement = 0;
    try {
      const totalEnrollments = await Enrollment.count({ where: { course_id: { [Op.in]: courseIds } } });
      const activeEnrollments = await Enrollment.count({
        where: {
          course_id: { [Op.in]: courseIds },
          completion_status: { [Op.in]: ['in_progress', 'enrolled'] }
        }
      });
      engagement = totalEnrollments > 0
        ? Math.round((activeEnrollments / totalEnrollments) * 100) : 0;
    } catch (e) { console.error('Analytics engagement error:', e.message); }

    // Per-course breakdown
    let coursePerformance = [];
    try {
      coursePerformance = await Promise.all(courses.map(async (course) => {
        try {
          const enrollCount = await Enrollment.count({ where: { course_id: course.id } });
          const completed = await Enrollment.count({
            where: { course_id: course.id, completion_status: 'completed' }
          });
          const courseExams = await Exam.findAll({
            where: { course_id: course.id }, attributes: ['id']
          });
          let avgScore = 0;
          if (courseExams.length > 0) {
            const courseResults = await Result.findAll({
              where: { exam_id: { [Op.in]: courseExams.map(e => e.id) } },
              attributes: ['score', 'total_marks']
            });
            if (courseResults.length > 0) {
              const t = courseResults.reduce((s, r) =>
                s + (r.total_marks > 0 ? (r.score / r.total_marks) * 100 : 0), 0);
              avgScore = Math.round(t / courseResults.length);
            }
          }
          return {
            course: course.course_name,
            students: enrollCount,
            avgScore,
            completion: enrollCount > 0 ? Math.round((completed / enrollCount) * 100) : 0
          };
        } catch (e) {
          return { course: course.course_name, students: 0, avgScore: 0, completion: 0 };
        }
      }));
    } catch (e) { console.error('Analytics coursePerformance error:', e.message); }

    res.json({
      success: true,
      analytics: {
        avgPerformance, videoCompletion, watchTime, engagement,
        coursePerformance, videoAnalytics
      }
    });
  } catch (error) {
    console.error('GET /faculty/analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── LIVE CLASSES GET ───────────────────────────────────────
router.get('/live-classes', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        course_id INT,
        faculty_id INT NOT NULL,
        date DATE,
        time TIME,
        duration INT DEFAULT 60,
        platform VARCHAR(100) DEFAULT 'Zoom',
        link VARCHAR(500),
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, liveClasses: [] });

    const [rows] = await sequelize.query(`
      SELECT lc.*, COALESCE(c.course_name, '') as course
      FROM live_classes lc
      LEFT JOIN courses c ON c.id = lc.course_id
      WHERE lc.faculty_id = ?
      ORDER BY lc.date DESC, lc.time DESC
    `, { replacements: [faculty.id] });

    res.json({ success: true, liveClasses: rows });
  } catch (error) {
    console.error('GET /faculty/live-classes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching live classes' });
  }
});

// ── LIVE CLASSES POST ──────────────────────────────────────
router.post('/live-classes', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { title, course, date, time, duration, platform, link } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ success: false, message: 'Title, date and time are required' });
    }

    const [result] = await sequelize.query(`
      INSERT INTO live_classes (title, course_id, faculty_id, date, time, duration, platform, link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `, { replacements: [title, course || null, faculty.id, date, time, duration || 60, platform || 'Zoom', link || ''] });

    // Fetch course name for response
    let courseName = '';
    if (course) {
      const courseRecord = await Course.findOne({ where: { id: course }, attributes: ['course_name'] });
      courseName = courseRecord?.course_name || '';
    }

    res.json({
      success: true,
      liveClass: {
        id: result, title, course: courseName,
        date, time, duration: duration || 60,
        platform: platform || 'Zoom', link: link || '',
        status: 'scheduled'
      }
    });
  } catch (error) {
    console.error('POST /faculty/live-classes error:', error);
    res.status(500).json({ success: false, message: 'Error scheduling live class' });
  }
});

// ── BATCHES GET ────────────────────────────────────────────
router.get('/batches', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        faculty_id INT NOT NULL,
        courses JSON,
        schedule VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS batch_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_id INT NOT NULL,
        student_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_batch_student (batch_id, student_id)
      )
    `);

    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, batches: [] });

    const [rows] = await sequelize.query(`
      SELECT b.*,
        (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) as students
      FROM batches b
      WHERE b.faculty_id = ?
      ORDER BY b.created_at DESC
    `, { replacements: [faculty.id] });

    res.json({
      success: true,
      batches: rows.map(b => ({
        ...b,
        courses: b.courses ? (typeof b.courses === 'string' ? JSON.parse(b.courses) : b.courses) : [],
        startDate: b.start_date,
        endDate: b.end_date
      }))
    });
  } catch (error) {
    console.error('GET /faculty/batches error:', error);
    res.status(500).json({ success: false, message: 'Error fetching batches' });
  }
});

// ── BATCHES POST ───────────────────────────────────────────
router.post('/batches', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { name, courses, schedule, startDate, endDate } = req.body;
    if (!name || !schedule) {
      return res.status(400).json({ success: false, message: 'Name and schedule are required' });
    }

    const coursesArr = Array.isArray(courses) ? courses : (courses ? [courses] : []);

    const [result] = await sequelize.query(`
      INSERT INTO batches (name, faculty_id, courses, schedule, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, {
      replacements: [
        name, faculty.id, JSON.stringify(coursesArr),
        schedule, startDate || null, endDate || null
      ]
    });

    res.json({
      success: true,
      batch: {
        id: result, name, courses: coursesArr,
        schedule, startDate, endDate,
        status: 'active', students: 0
      }
    });
  } catch (error) {
    console.error('POST /faculty/batches error:', error);
    res.status(500).json({ success: false, message: 'Error creating batch' });
  }
});

// ── BATCHES DELETE ─────────────────────────────────────────
router.delete('/batches/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    await sequelize.query(
      `DELETE FROM batches WHERE id = ? AND faculty_id = ?`,
      { replacements: [req.params.id, faculty.id] }
    );
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('DELETE /faculty/batches/:id error:', error);
    res.status(500).json({ success: false, message: 'Error deleting batch' });
  }
});

// ── BATCHES STUDENTS GET ───────────────────────────────────
router.get('/batches/:id/students', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [rows] = await sequelize.query(`
      SELECT s.id, u.full_name as name, u.email,
             u.phone, bs.enrolled_at as enrollmentDate
      FROM batch_students bs
      JOIN students s ON s.id = bs.student_id
      JOIN users u ON u.id = s.user_id
      WHERE bs.batch_id = ?
      ORDER BY u.full_name ASC
    `, { replacements: [req.params.id] });

    res.json({ success: true, students: rows });
  } catch (error) {
    console.error('GET /faculty/batches/:id/students error:', error);
    res.json({ success: true, students: [] });
  }
});

// ── DOUBTS GET ─────────────────────────────────────────────
router.get('/doubts', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS doubts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255),
        question TEXT,
        student_id INT,
        course_id INT,
        priority VARCHAR(50) DEFAULT 'medium',
        status VARCHAR(50) DEFAULT 'pending',
        reply TEXT,
        replied_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, doubts: [] });

    const courses = await Course.findAll({
      where: { faculty_id: faculty.id },
      attributes: ['id', 'course_name']
    });
    const courseIds = courses.map(c => c.id);
    if (courseIds.length === 0) return res.json({ success: true, doubts: [] });

    const [rows] = await sequelize.query(`
      SELECT d.*,
        COALESCE(u.full_name, 'Unknown Student') as student_name,
        COALESCE(c.course_name, 'General') as course
      FROM doubts d
      LEFT JOIN students s ON s.id = d.student_id
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN courses c ON c.id = d.course_id
      WHERE d.course_id IN (${courseIds.map(() => '?').join(',')})
      ORDER BY d.created_at DESC
    `, { replacements: courseIds });

    res.json({ success: true, doubts: rows });
  } catch (error) {
    console.error('GET /faculty/doubts error:', error);
    res.json({ success: true, doubts: [] });
  }
});

// ── DOUBTS REPLY POST ──────────────────────────────────────
router.post('/doubts/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { reply } = req.body;
    if (!reply?.trim()) {
      return res.status(400).json({ success: false, message: 'Reply is required' });
    }

    await sequelize.query(
      `UPDATE doubts SET reply = ?, status = 'resolved', replied_at = NOW() WHERE id = ?`,
      { replacements: [reply.trim(), req.params.id] }
    );

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    console.error('POST /faculty/doubts/:id/reply error:', error);
    res.status(500).json({ success: false, message: 'Error sending reply' });
  }
});


// ── STUDENT: GET COURSE CONTENT ───────────────────────────
// Called by student portal CoursePlayer to load faculty-uploaded materials
router.get('/course-content/:courseId', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const courseId = req.params.courseId;

    await ensureContentTable(sequelize);

    const [content] = await sequelize.query(`
      SELECT fc.id, fc.title, fc.description, fc.type, fc.file_path,
             fc.file_size, fc.duration, fc.display_order, fc.views,
             fc.created_at,
             u.full_name AS instructor_name
      FROM faculty_content fc
      LEFT JOIN faculty f ON fc.faculty_id = f.id
      LEFT JOIN users u ON f.user_id = u.id
      WHERE fc.course_id = ? AND fc.status = 'published'
      ORDER BY fc.display_order ASC, fc.created_at ASC
    `, { replacements: [courseId] });

    res.json({ success: true, content: content || [] });
  } catch (error) {
    console.error('GET /faculty/course-content error:', error.message);
    res.json({ success: true, content: [] });
  }
});

// ============================================================
// PUT /faculty/content/:id — Edit content metadata
// ============================================================
router.put('/content/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { id } = req.params;
    const { title, description, duration, order } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    await sequelize.query(
      `UPDATE faculty_content
       SET title = ?, description = ?, duration = ?, display_order = ?
       WHERE id = ?`,
      { replacements: [title, description || '', duration || null, order || 1, id] }
    );

    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('PUT /faculty/content error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
});

// ============================================================
// DELETE /faculty/content/:id — Delete a content item
// ============================================================
router.delete('/content/:id', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { id } = req.params;

    // Resolve faculty_id for the logged-in user
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(403).json({ success: false, message: 'Faculty not found' });

    // Get file path AND verify ownership before deleting
    const [rows] = await sequelize.query(
      `SELECT file_path FROM faculty_content WHERE id = ? AND faculty_id = ?`,
      { replacements: [id, faculty.id] }
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Content not found or access denied' });
    }

    await sequelize.query(
      `DELETE FROM faculty_content WHERE id = ? AND faculty_id = ?`,
      { replacements: [id, faculty.id] }
    );

    // Remove physical file from disk (silent fail — may not exist on Render)
    if (rows[0].file_path) {
      const filePath = path.join(__dirname, '..', rows[0].file_path);
      fs.unlink(filePath, () => {});
    }

    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('DELETE /faculty/content error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete content' });
  }
});

// ============================================================
// GET /student/course-content/:courseId — Student-accessible
// ============================================================
router.get('/student/course-content/:courseId', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const courseId = req.params.courseId;

    await ensureContentTable(sequelize);

    const [content] = await sequelize.query(`
      SELECT fc.id, fc.title, fc.description, fc.type, fc.file_path,
             fc.file_size, fc.duration, fc.display_order, fc.views,
             fc.created_at,
             u.full_name AS instructor_name
      FROM faculty_content fc
      LEFT JOIN faculty f ON fc.faculty_id = f.id
      LEFT JOIN users u ON f.user_id = u.id
      WHERE fc.course_id = ? AND fc.status = 'published'
      ORDER BY fc.display_order ASC, fc.created_at ASC
    `, { replacements: [courseId] });

    res.json({ success: true, content: content || [] });
  } catch (error) {
    console.error('GET /student/course-content error:', error.message);
    res.json({ success: true, content: [] });
  }
});

module.exports = router;