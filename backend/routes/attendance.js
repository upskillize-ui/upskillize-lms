// routes/attendance.js
// ═══════════════════════════════════════════════════════════════
// ATTENDANCE SYSTEM — Faculty marks, Student views, Nudge AI connected
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { Faculty, Student, Course, Enrollment, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const db = require('../models');
const sequelize = db.sequelize;

// ─────────────────────────────────────────────────────────────
// AUTO-CREATE TABLES ON FIRST USE
// ─────────────────────────────────────────────────────────────
let _tablesReady = false;
async function ensureTables() {
  if (_tablesReady) return;
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      course_id INT NOT NULL,
      batch_id INT DEFAULT NULL,
      faculty_id INT NOT NULL,
      session_date DATE NOT NULL,
      session_type VARCHAR(20) DEFAULT 'live',
      status VARCHAR(20) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id INT NOT NULL,
      student_id INT NOT NULL,
      course_id INT NOT NULL,
      status VARCHAR(20) DEFAULT 'absent',
      marked_by INT DEFAULT NULL,
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_session_student (session_id, student_id)
    )
  `);
  _tablesReady = true;
}

// ═════════════════════════════════════════════════════════════
// FACULTY: Create attendance session
// POST /api/attendance/session
// ═════════════════════════════════════════════════════════════
router.post('/session', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTables();
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const { title, course_id, batch_id, session_date, session_type } = req.body;
    if (!title || !course_id) {
      return res.status(400).json({ success: false, message: 'Title and course_id are required' });
    }

    const [result] = await sequelize.query(
      `INSERT INTO attendance_sessions (title, course_id, batch_id, faculty_id, session_date, session_type, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', NOW())`,
      { replacements: [title, course_id, batch_id || null, faculty.id, session_date || new Date().toISOString().split('T')[0], session_type || 'live'] }
    );

    // Get all enrolled students for this course and pre-fill as absent
    const enrollments = await Enrollment.findAll({
      where: { course_id },
      attributes: ['student_id']
    });

    for (const e of enrollments) {
      await sequelize.query(
        `INSERT IGNORE INTO attendance_records (session_id, student_id, course_id, status, marked_at)
         VALUES (?, ?, ?, 'absent', NOW())`,
        { replacements: [result, e.student_id, course_id] }
      ).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Attendance session created',
      session_id: result,
      students_count: enrollments.length
    });
  } catch (error) {
    console.error('POST /attendance/session error:', error);
    res.status(500).json({ success: false, message: 'Error creating session', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Get all sessions for their courses
// GET /api/attendance/sessions
// ═════════════════════════════════════════════════════════════
router.get('/sessions', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTables();
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    if (!faculty) return res.json({ success: true, sessions: [] });

    const { course_id } = req.query;
    let query = `SELECT s.*, c.course_name,
                   (SELECT COUNT(*) FROM attendance_records r WHERE r.session_id = s.id AND r.status = 'present') AS present_count,
                   (SELECT COUNT(*) FROM attendance_records r WHERE r.session_id = s.id) AS total_count
                 FROM attendance_sessions s
                 LEFT JOIN courses c ON c.id = s.course_id
                 WHERE s.faculty_id = ?`;
    const params = [faculty.id];

    if (course_id) {
      query += ' AND s.course_id = ?';
      params.push(course_id);
    }
    query += ' ORDER BY s.session_date DESC, s.created_at DESC';

    const [sessions] = await sequelize.query(query, { replacements: params });
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('GET /attendance/sessions error:', error);
    res.json({ success: true, sessions: [] });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Get students for a session (to mark attendance)
// GET /api/attendance/session/:id/students
// ═════════════════════════════════════════════════════════════
router.get('/session/:id/students', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTables();
    const sessionId = req.params.id;

    const [session] = await sequelize.query(
      'SELECT * FROM attendance_sessions WHERE id = ? LIMIT 1',
      { replacements: [sessionId] }
    );
    if (!session.length) return res.status(404).json({ success: false, message: 'Session not found' });

    const [students] = await sequelize.query(
      `SELECT r.id AS record_id, r.student_id, r.status, r.marked_at,
              u.full_name, u.email, u.profile_photo
       FROM attendance_records r
       LEFT JOIN students st ON st.id = r.student_id
       LEFT JOIN users u ON u.id = st.user_id
       WHERE r.session_id = ?
       ORDER BY u.full_name ASC`,
      { replacements: [sessionId] }
    );

    res.json({
      success: true,
      session: session[0],
      students,
      summary: {
        total: students.length,
        present: students.filter(s => s.status === 'present').length,
        absent: students.filter(s => s.status === 'absent').length,
        late: students.filter(s => s.status === 'late').length,
      }
    });
  } catch (error) {
    console.error('GET /attendance/session/:id/students error:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Mark attendance for ONE student
// POST /api/attendance/mark
// Body: { session_id, student_id, status: 'present'|'absent'|'late' }
// ═════════════════════════════════════════════════════════════
router.post('/mark', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTables();
    const { session_id, student_id, status } = req.body;
    if (!session_id || !student_id || !status) {
      return res.status(400).json({ success: false, message: 'session_id, student_id, and status are required' });
    }

    const validStatuses = ['present', 'absent', 'late'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be: present, absent, or late' });
    }

    // Get session info
    const [session] = await sequelize.query(
      'SELECT * FROM attendance_sessions WHERE id = ? LIMIT 1',
      { replacements: [session_id] }
    );
    if (!session.length) return res.status(404).json({ success: false, message: 'Session not found' });

    // Update or insert attendance record
    const [existing] = await sequelize.query(
      'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ? LIMIT 1',
      { replacements: [session_id, student_id] }
    );

    if (existing.length) {
      await sequelize.query(
        'UPDATE attendance_records SET status = ?, marked_by = ?, marked_at = NOW() WHERE session_id = ? AND student_id = ?',
        { replacements: [status, req.user.id, session_id, student_id] }
      );
    } else {
      await sequelize.query(
        'INSERT INTO attendance_records (session_id, student_id, course_id, status, marked_by, marked_at) VALUES (?, ?, ?, ?, ?, NOW())',
        { replacements: [session_id, student_id, session[0].course_id, status, req.user.id] }
      );
    }

    // ══════════════════════════════════════════════════════════
    // NUDGE AI: Send attendance to agent
    // ══════════════════════════════════════════════════════════
    const nudge = req.app.get('nudge');
    if (nudge) {
      try {
        // Get student name
        const student = await Student.findByPk(student_id, {
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        });
        const studentName = student?.user?.full_name || '';

        // Get batch_id if available
        const batchId = session[0].batch_id
          ? `batch_${session[0].batch_id}`
          : `course_${session[0].course_id}`;

        // Get faculty name as mentor_id
        const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
        const mentorId = faculty ? `faculty_${faculty.id}` : '';

        nudge.attendance(
          String(student_id),               // user_id
          String(session[0].course_id),      // course_id
          batchId,                           // batch_id
          status === 'present' || status === 'late',  // attended (late = attended)
          session[0].title || '',            // lecture_title
          mentorId,                          // mentor_id
          studentName                        // student_name
        ).catch(() => {});
      } catch (nudgeErr) {
        console.warn('Nudge attendance failed (non-critical):', nudgeErr.message);
      }
    }

    res.json({ success: true, message: `Marked ${status}` });
  } catch (error) {
    console.error('POST /attendance/mark error:', error);
    res.status(500).json({ success: false, message: 'Error marking attendance', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Mark attendance for ALL students at once (bulk)
// POST /api/attendance/mark-bulk
// Body: { session_id, records: [{ student_id, status }] }
// ═════════════════════════════════════════════════════════════
router.post('/mark-bulk', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTables();
    const { session_id, records } = req.body;
    if (!session_id || !records || !records.length) {
      return res.status(400).json({ success: false, message: 'session_id and records are required' });
    }

    // Get session info
    const [session] = await sequelize.query(
      'SELECT * FROM attendance_sessions WHERE id = ? LIMIT 1',
      { replacements: [session_id] }
    );
    if (!session.length) return res.status(404).json({ success: false, message: 'Session not found' });

    let marked = 0;
    const nudge = req.app.get('nudge');

    for (const record of records) {
      const { student_id, status } = record;
      if (!student_id || !status) continue;

      const [existing] = await sequelize.query(
        'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ? LIMIT 1',
        { replacements: [session_id, student_id] }
      );

      if (existing.length) {
        await sequelize.query(
          'UPDATE attendance_records SET status = ?, marked_by = ?, marked_at = NOW() WHERE session_id = ? AND student_id = ?',
          { replacements: [status, req.user.id, session_id, student_id] }
        );
      } else {
        await sequelize.query(
          'INSERT INTO attendance_records (session_id, student_id, course_id, status, marked_by, marked_at) VALUES (?, ?, ?, ?, ?, NOW())',
          { replacements: [session_id, student_id, session[0].course_id, status, req.user.id] }
        );
      }
      marked++;

      // Send to Nudge AI
      if (nudge) {
        const batchId = session[0].batch_id
          ? `batch_${session[0].batch_id}`
          : `course_${session[0].course_id}`;

        nudge.attendance(
          String(student_id),
          String(session[0].course_id),
          batchId,
          status === 'present' || status === 'late',
          session[0].title || '',
          '',
          ''
        ).catch(() => {});
      }
    }

    // Close the session after bulk marking
    await sequelize.query(
      "UPDATE attendance_sessions SET status = 'closed' WHERE id = ?",
      { replacements: [session_id] }
    );

    res.json({ success: true, message: `Marked ${marked} students`, marked });
  } catch (error) {
    console.error('POST /attendance/mark-bulk error:', error);
    res.status(500).json({ success: false, message: 'Error marking bulk attendance', error: error.message });
  }
});

// ═════════════════════════════════════════════════════════════
// FACULTY: Get attendance report for a course
// GET /api/attendance/report?course_id=1
// ═════════════════════════════════════════════════════════════
router.get('/report', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    await ensureTables();
    const { course_id, batch_id } = req.query;
    if (!course_id) return res.status(400).json({ success: false, message: 'course_id is required' });

    const [report] = await sequelize.query(
      `SELECT r.student_id, u.full_name, u.email,
              COUNT(*) AS total_sessions,
              SUM(CASE WHEN r.status = 'present' THEN 1 ELSE 0 END) AS present_count,
              SUM(CASE WHEN r.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
              SUM(CASE WHEN r.status = 'late' THEN 1 ELSE 0 END) AS late_count,
              ROUND(SUM(CASE WHEN r.status IN ('present','late') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS attendance_pct
       FROM attendance_records r
       LEFT JOIN students st ON st.id = r.student_id
       LEFT JOIN users u ON u.id = st.user_id
       WHERE r.course_id = ?
       GROUP BY r.student_id, u.full_name, u.email
       ORDER BY attendance_pct ASC`,
      { replacements: [course_id] }
    );

    res.json({
      success: true,
      report,
      summary: {
        total_students: report.length,
        below_75: report.filter(r => r.attendance_pct < 75).length,
        below_50: report.filter(r => r.attendance_pct < 50).length,
      }
    });
  } catch (error) {
    console.error('GET /attendance/report error:', error);
    res.status(500).json({ success: false, message: 'Error fetching report' });
  }
});

// ═════════════════════════════════════════════════════════════
// STUDENT: View my attendance
// GET /api/attendance/my
// ═════════════════════════════════════════════════════════════
router.get('/my', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    await ensureTables();
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.json({ success: true, attendance: [] });

    const { course_id } = req.query;
    let query = `SELECT r.status, r.marked_at, s.title, s.session_date, s.session_type,
                        c.course_name, c.id AS course_id
                 FROM attendance_records r
                 LEFT JOIN attendance_sessions s ON s.id = r.session_id
                 LEFT JOIN courses c ON c.id = r.course_id
                 WHERE r.student_id = ?`;
    const params = [student.id];

    if (course_id) {
      query += ' AND r.course_id = ?';
      params.push(course_id);
    }
    query += ' ORDER BY s.session_date DESC';

    const [records] = await sequelize.query(query, { replacements: params });

    // Calculate summary per course
    const courseMap = {};
    for (const r of records) {
      const cid = r.course_id;
      if (!courseMap[cid]) {
        courseMap[cid] = { course_name: r.course_name, total: 0, present: 0, absent: 0, late: 0 };
      }
      courseMap[cid].total++;
      if (r.status === 'present') courseMap[cid].present++;
      else if (r.status === 'absent') courseMap[cid].absent++;
      else if (r.status === 'late') courseMap[cid].late++;
    }

    const summary = Object.entries(courseMap).map(([cid, data]) => ({
      course_id: parseInt(cid),
      course_name: data.course_name,
      total: data.total,
      present: data.present + data.late,
      absent: data.absent,
      percentage: data.total > 0 ? Math.round(((data.present + data.late) / data.total) * 100) : 0,
    }));

    res.json({ success: true, records, summary });
  } catch (error) {
    console.error('GET /attendance/my error:', error);
    res.json({ success: true, records: [], summary: [] });
  }
});

module.exports = router;