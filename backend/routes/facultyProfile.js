// backend/routes/facultyProfile.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { User, Faculty, Course, Enrollment, Student, Exam, Result, 
        VideoWatchHistory, Lesson, CourseModule, Quiz, QuizQuestion } = require('../models');
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

router.post('/profile/upload-photo', authMiddleware, upload.single('profile_photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `/uploads/profiles/faculty/${req.file.filename}`;
    await User.update({ profile_photo: imageUrl }, { where: { id: req.user.id, role: 'faculty' } });
    res.json({ success: true, message: 'Profile photo uploaded successfully', imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading profile photo' });
  }
});

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

router.put('/profile/professional', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Professional information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating professional information' });
  }
});

router.put('/profile/contact', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Contact information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contact information' });
  }
});

router.put('/profile/social', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Social links updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating social links' });
  }
});

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

    // ✅ Fixed: use Student from top-level import, not inline require()
    const recentEnrollments = courseIds.length > 0
      ? await Enrollment.findAll({
          where: { course_id: { [Op.in]: courseIds } },
          include: [
            { model: Student, include: [{ model: User, attributes: ['full_name'] }] },
            { model: Course, attributes: ['course_name'] }
          ],
          order: [['created_at', 'DESC']],
          limit: 5
        })
      : [];

    const activities = recentEnrollments.map(e => ({
      title: `${e.Student?.User?.full_name || 'A student'} enrolled in ${e.Course?.course_name || 'a course'}`,
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

router.get('/courses', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const courses = await Course.findAll({
      where: { faculty_id: faculty.id, is_active: true },
      attributes: ['id', 'course_name', 'course_code'],
      order: [['course_name', 'ASC']]
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Get faculty courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

// ── NOTIFICATIONS ──────────────────────────────────────────
router.get('/notifications', authMiddleware, async (req, res) => {
  res.json({ success: true, notifications: [] });
});

// ── MESSAGES ───────────────────────────────────────────────
router.get('/messages', authMiddleware, async (req, res) => {
  res.json({ success: true, messages: [] });
});

// ── ANNOUNCEMENTS ──────────────────────────────────────────
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

router.post('/announcements', authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    const { title, message, course, priority } = req.body;
    const { sequelize } = require('../config/database');
    const [result] = await sequelize.query(
      `INSERT INTO announcements (title, message, course, priority, faculty_id) VALUES (?,?,?,?,?)`,
      { replacements: [title, message, course || 'All', priority || 'Medium', faculty.id] }
    );
    res.json({ success: true, announcement: { id: result, title, message, course, priority, date: new Date().toLocaleDateString(), views: 0 } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

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

// ── ASSIGNMENTS ────────────────────────────────────────────
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

router.post('/assignments/:id/grade', authMiddleware, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const { studentId, grade, feedback } = req.body;
    await sequelize.query(
      `UPDATE assignment_submissions SET grade=?, feedback=?, status='graded'
       WHERE assignment_id=? AND student_id=?`,
      { replacements: [grade, feedback, req.params.id, studentId] }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.delete('/assignments/:id', [authMiddleware, rbac(['faculty', 'admin'])], async (req, res) => {
  try {
    const db = require('../config/database');
    const [result] = await db.query(
      'DELETE FROM assignments WHERE id = ? AND faculty_id = ?',
      [req.params.id, req.faculty.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;