// routes/attendance.js
// ═══════════════════════════════════════════════════════════════
// AUTOMATIC ATTENDANCE — No manual marking by faculty
//
// How it works:
// 1. Student opens a lesson → auto-marks "joined" with timestamp
// 2. Video player sends progress → updates watch duration
// 3. Student closes/leaves → marks "left" with timestamp
// 4. Faculty, student, admin can all VIEW the data
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { Faculty, Student, Course, Enrollment, User, Lesson, CourseModule } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const db = require('../models');
const sequelize = db.sequelize;

// ─────────────────────────────────────────────────────────────
// AUTO-CREATE TABLE ON FIRST USE
// ─────────────────────────────────────────────────────────────
let _tableReady = false;
async function ensureTable() {
  if (_tableReady) return;
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS student_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      user_id INT NOT NULL,
      course_id INT NOT NULL,
      lesson_id INT DEFAULT NULL,
      lesson_title VARCHAR(255) DEFAULT '',
      session_date DATE NOT NULL,
      joined_at DATETIME NOT NULL,
      left_at DATETIME DEFAULT NULL,
      duration_minutes INT DEFAULT 0,
      watch_percent INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'joined',
      ip_address VARCHAR(50) DEFAULT '',
      device VARCHAR(100) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_lesson_date (student_id, lesson_id, session_date)
    )
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS student_logins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      student_id INT DEFAULT NULL,
      login_at DATETIME NOT NULL,
      logout_at DATETIME DEFAULT NULL,
      duration_minutes INT DEFAULT 0,
      ip_address VARCHAR(50) DEFAULT '',
      device VARCHAR(255) DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  _tableReady = true;
}

// ═════════════════════════════════════════════════════════════
// AUTO-RECORD: Student OPENS a lesson
// POST /api/attendance/join
// Frontend calls this when student clicks on any lesson
// Body: { lesson_id, course_id }
// ═════════════════════════════════════════════════════════════
router.post('/join', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    await ensureTable();
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { lesson_id, course_id } = req.body;
    if (!lesson_id) return res.status(400).json({ success: false, message: 'lesson_id is required' });

    // Get lesson title
    let lessonTitle = '';
    try {
      const lesson = await Lesson.findByPk(lesson_id);
      lessonTitle = lesson?.title || lesson?.lesson_title || '';
    } catch (e) {}

    // Determine course_id from lesson if not provided
    let cId = course_id;
    if (!cId) {
      try {
        const lesson = await Lesson.findByPk(lesson_id, { include: [{ model: CourseModule }] });
        cId = lesson?.CourseModule?.course_id || 0;
      } catch (e) {}
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    const device = req.headers['user-agent'] || '';

    // Check if already joined this lesson today
    const [existing] = await sequelize.query(
      'SELECT id, joined_at FROM student_attendance WHERE student_id = ? AND lesson_id = ? AND session_date = ? LIMIT 1',
      { replacements: [student.id, lesson_id, today] }
    );

    if (existing.length) {
      await sequelize.query(
        "UPDATE student_attendance SET status = 'watching', updated_at = NOW() WHERE id = ?",
        { replacements: [existing[0].id] }
      );
    } else {
      await sequelize.query(
        `INSERT INTO student_attendance
         (student_id, user_id, course_id, lesson_id, lesson_title, session_date, joined_at, status, ip_address, device)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'joined', ?, ?)`,
        { replacements: [student.id, req.user.id, cId || 0, lesson_id, lessonTitle, today, now, ip, device.substring(0, 100)] }
      );

      // Nudge AI: student is active (attended)
      const nudge = req.app.get('nudge');
      if (nudge && cId) {
        const user = await User.findByPk(req.user.id, { attributes: ['full_name'] });
        nudge.attendance(
          String(student.id), String(cId), `course_${cId}`,
          true, lessonTitle, '', user?.full_name || ''
        ).catch(() => {});
      }
    }

    res.json({ success: true, message: 'Attendance recorded', joined_at: now });
  } catch (error) {
    console.error('POST /attendance/join error:', error);
    res.status(500).json({ success: false, message: 'Error recording attendance', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// AUTO-UPDATE: Video player sends progress
// POST /api/attendance/progress
// Body: { lesson_id, watch_percent, current_minutes }
// ═════════════════════════════════════════════════════════════
router.post('/progress', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    await ensureTable();
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.json({ success: true });

    const { lesson_id, watch_percent, current_minutes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    await sequelize.query(
      `UPDATE student_attendance
       SET watch_percent = GREATEST(watch_percent, ?),
           duration_minutes = GREATEST(duration_minutes, ?),
           status = 'watching',
           updated_at = NOW()
       WHERE student_id = ? AND lesson_id = ? AND session_date = ?`,
      { replacements: [watch_percent || 0, current_minutes || 0, student.id, lesson_id, today] }
    );

    res.json({ success: true });
  } catch (error) {
    res.json({ success: true }); // Silent fail — don't break video
  }
});

// ═════════════════════════════════════════════════════════════
// AUTO-RECORD: Student LEAVES a lesson
// POST /api/attendance/leave
// Frontend calls this on page unload / navigation away
// Body: { lesson_id }
// ═════════════════════════════════════════════════════════════
router.post('/leave', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    await ensureTable();
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.json({ success: true });

    const { lesson_id } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const [record] = await sequelize.query(
      'SELECT id, joined_at FROM student_attendance WHERE student_id = ? AND lesson_id = ? AND session_date = ? LIMIT 1',
      { replacements: [student.id, lesson_id, today] }
    );

    if (record.length) {
      const joinedAt = new Date(record[0].joined_at);
      const now = new Date();
      const durationMin = Math.round((now - joinedAt) / 60000);

      await sequelize.query(
        `UPDATE student_attendance
         SET left_at = ?, duration_minutes = GREATEST(duration_minutes, ?), status = 'completed', updated_at = NOW()
         WHERE id = ?`,
        { replacements: [now, durationMin, record[0].id] }
      );
    }

    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    res.json({ success: true });
  }
});

// ═════════════════════════════════════════════════════════════
// Track login (call from auth.js after successful login)
// POST /api/attendance/login
// ═════════════════════════════════════════════════════════════
router.post('/login', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
    const device = req.headers['user-agent'] || '';

    await sequelize.query(
      `INSERT INTO student_logins (user_id, student_id, login_at, ip_address, device)
       VALUES (?, ?, NOW(), ?, ?)`,
      { replacements: [req.user.id, student?.id || null, ip, device.substring(0, 255)] }
    );

    // Nudge AI: track login for ML data
    const nudge = req.app.get('nudge');
    if (nudge) nudge.login(String(req.user.id), '', 0).catch(() => {});

    res.json({ success: true });
  } catch (error) {
    res.json({ success: true });
  }
});

// ═════════════════════════════════════════════════════════════
// STUDENT VIEW: My attendance
// GET /api/attendance/my?course_id=5
// ═════════════════════════════════════════════════════════════
router.get('/my', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    await ensureTable();
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.json({ success: true, records: [], summary: [], logins: [] });

    const { course_id } = req.query;

    let query = `SELECT a.*, c.course_name
                 FROM student_attendance a
                 LEFT JOIN courses c ON c.id = a.course_id
                 WHERE a.student_id = ?`;
    const params = [student.id];
    if (course_id) { query += ' AND a.course_id = ?'; params.push(course_id); }
    query += ' ORDER BY a.session_date DESC, a.joined_at DESC LIMIT 100';

    const [records] = await sequelize.query(query, { replacements: params });

    const [summary] = await sequelize.query(
      `SELECT a.course_id, c.course_name,
              COUNT(DISTINCT a.session_date) AS days_attended,
              COUNT(DISTINCT a.lesson_id) AS lessons_watched,
              SUM(a.duration_minutes) AS total_minutes,
              ROUND(AVG(a.watch_percent), 0) AS avg_watch_percent
       FROM student_attendance a
       LEFT JOIN courses c ON c.id = a.course_id
       WHERE a.student_id = ?
       ${course_id ? 'AND a.course_id = ?' : ''}
       GROUP BY a.course_id, c.course_name`,
      { replacements: course_id ? [student.id, course_id] : [student.id] }
    );

    const [logins] = await sequelize.query(
      `SELECT login_at, ip_address, device FROM student_logins
       WHERE user_id = ? ORDER BY login_at DESC LIMIT 20`,
      { replacements: [req.user.id] }
    );

    res.json({
      success: true,
      records: records.map(r => ({
        ...r,
        joined_at: r.joined_at,
        left_at: r.left_at,
        duration: `${r.duration_minutes || 0} min`,
        watch_percent: r.watch_percent || 0,
      })),
      summary: summary.map(s => ({
        ...s,
        total_hours: Math.round((s.total_minutes || 0) / 60 * 10) / 10,
      })),
      logins,
    });
  } catch (error) {
    console.error('GET /attendance/my error:', error);
    res.json({ success: true, records: [], summary: [], logins: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY/MENTOR VIEW: Attendance for their course
// GET /api/attendance/course/:course_id
// ═════════════════════════════════════════════════════════════
router.get('/course/:course_id', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTable();
    const courseId = req.params.course_id;

    const [students] = await sequelize.query(
      `SELECT a.student_id, u.full_name, u.email, u.profile_photo,
              COUNT(DISTINCT a.session_date) AS days_attended,
              COUNT(DISTINCT a.lesson_id) AS lessons_watched,
              SUM(a.duration_minutes) AS total_minutes,
              ROUND(AVG(a.watch_percent), 0) AS avg_watch_percent,
              MAX(a.joined_at) AS last_active,
              MIN(a.joined_at) AS first_active
       FROM student_attendance a
       LEFT JOIN students st ON st.id = a.student_id
       LEFT JOIN users u ON u.id = st.user_id
       WHERE a.course_id = ?
       GROUP BY a.student_id, u.full_name, u.email, u.profile_photo
       ORDER BY last_active DESC`,
      { replacements: [courseId] }
    );

    const [lessonCount] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM lessons l
       JOIN course_modules cm ON cm.id = l.course_module_id
       WHERE cm.course_id = ?`,
      { replacements: [courseId] }
    );
    const totalLessons = lessonCount[0]?.total || 0;

    const enriched = students.map(s => ({
      ...s,
      total_hours: Math.round((s.total_minutes || 0) / 60 * 10) / 10,
      lesson_progress: totalLessons > 0
        ? Math.round(((s.lessons_watched || 0) / totalLessons) * 100) : 0,
      status: (s.total_minutes || 0) === 0 ? 'inactive'
        : (s.avg_watch_percent || 0) >= 70 ? 'active' : 'at_risk'
    }));

    res.json({
      success: true,
      course_id: courseId,
      total_lessons: totalLessons,
      total_students: students.length,
      students: enriched,
      at_risk: enriched.filter(s => s.status === 'at_risk').length,
      inactive: enriched.filter(s => s.status === 'inactive').length,
    });
  } catch (error) {
    console.error('GET /attendance/course error:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance' });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Detailed timeline for ONE student
// GET /api/attendance/student/:student_id?course_id=5
// ═════════════════════════════════════════════════════════════
router.get('/student/:student_id', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTable();
    const studentId = req.params.student_id;
    const { course_id } = req.query;

    const student = await Student.findByPk(studentId, {
      include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'profile_photo'] }]
    });

    let query = `SELECT a.*, c.course_name
                 FROM student_attendance a
                 LEFT JOIN courses c ON c.id = a.course_id
                 WHERE a.student_id = ?`;
    const params = [studentId];
    if (course_id) { query += ' AND a.course_id = ?'; params.push(course_id); }
    query += ' ORDER BY a.joined_at DESC LIMIT 200';

    const [records] = await sequelize.query(query, { replacements: params });

    const [logins] = await sequelize.query(
      `SELECT login_at, ip_address, device FROM student_logins
       WHERE student_id = ? ORDER BY login_at DESC LIMIT 30`,
      { replacements: [studentId] }
    );

    const [courseSummary] = await sequelize.query(
      `SELECT a.course_id, c.course_name,
              COUNT(DISTINCT a.session_date) AS days_attended,
              COUNT(DISTINCT a.lesson_id) AS lessons_watched,
              SUM(a.duration_minutes) AS total_minutes,
              ROUND(AVG(a.watch_percent), 0) AS avg_watch_percent,
              MAX(a.joined_at) AS last_active
       FROM student_attendance a
       LEFT JOIN courses c ON c.id = a.course_id
       WHERE a.student_id = ?
       ${course_id ? 'AND a.course_id = ?' : ''}
       GROUP BY a.course_id, c.course_name`,
      { replacements: course_id ? [studentId, course_id] : [studentId] }
    );

    res.json({
      success: true,
      student: {
        id: studentId,
        name: student?.user?.full_name || 'Unknown',
        email: student?.user?.email || '',
        photo: student?.user?.profile_photo || null,
      },
      records: records.map(r => ({
        ...r,
        duration: `${r.duration_minutes || 0} min`,
      })),
      logins,
      course_summary: courseSummary.map(s => ({
        ...s,
        total_hours: Math.round((s.total_minutes || 0) / 60 * 10) / 10,
      })),
    });
  } catch (error) {
    console.error('GET /attendance/student error:', error);
    res.status(500).json({ success: false, message: 'Error fetching student attendance' });
  }
});

// ═════════════════════════════════════════════════════════════
// ADMIN VIEW: Attendance across ALL courses
// GET /api/attendance/admin/overview?days=30
// ═════════════════════════════════════════════════════════════
router.get('/admin/overview', authMiddleware, rbac(['admin']), async (req, res) => {
  try {
    await ensureTable();
    const { days } = req.query;
    const since = days ? `AND a.session_date >= DATE_SUB(CURDATE(), INTERVAL ${parseInt(days)} DAY)` : '';

    const [courses] = await sequelize.query(
      `SELECT a.course_id, c.course_name,
              COUNT(DISTINCT a.student_id) AS active_students,
              COUNT(DISTINCT a.session_date) AS active_days,
              SUM(a.duration_minutes) AS total_minutes,
              ROUND(AVG(a.watch_percent), 0) AS avg_watch_percent
       FROM student_attendance a
       LEFT JOIN courses c ON c.id = a.course_id
       WHERE 1=1 ${since}
       GROUP BY a.course_id, c.course_name
       ORDER BY active_students DESC`
    );

    const [daily] = await sequelize.query(
      `SELECT session_date, COUNT(DISTINCT student_id) AS active_students
       FROM student_attendance
       WHERE session_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY session_date ORDER BY session_date ASC`
    );

    const [loginsToday] = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM student_logins WHERE DATE(login_at) = CURDATE()`
    );

    const [inactive] = await sequelize.query(
      `SELECT s.id AS student_id, u.full_name, u.email,
              MAX(a.joined_at) AS last_active,
              DATEDIFF(NOW(), MAX(a.joined_at)) AS days_inactive
       FROM students s
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN student_attendance a ON a.student_id = s.id
       GROUP BY s.id, u.full_name, u.email
       HAVING days_inactive >= 7 OR last_active IS NULL
       ORDER BY days_inactive DESC LIMIT 50`
    );

    res.json({
      success: true,
      logins_today: loginsToday[0]?.cnt || 0,
      courses: courses.map(c => ({ ...c, total_hours: Math.round((c.total_minutes || 0) / 60) })),
      daily_active: daily,
      inactive_students: inactive,
    });
  } catch (error) {
    console.error('GET /attendance/admin/overview error:', error);
    res.status(500).json({ success: false, message: 'Error fetching overview' });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Get my courses (for dropdown filter)
// GET /api/attendance/my-courses
// ═════════════════════════════════════════════════════════════
router.get('/my-courses', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const courses = await Course.findAll({ attributes: ['id', 'course_name'], where: { is_active: true } });
      return res.json({ success: true, courses });
    }
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, courses: [] });
    const courses = await Course.findAll({ where: { faculty_id: faculty.id, is_active: true }, attributes: ['id', 'course_name'] });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: true, courses: [] });
  }
});

module.exports = router;