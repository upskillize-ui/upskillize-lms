// ============================================================
//  routes/institute.js  — All Institute Dashboard API Routes
//  Mount in app.js:  app.use('/api/institute', instituteRouter)
// ============================================================
const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');
const multer  = require('multer');
const upload  = multer({ storage: multer.memoryStorage() });

// ── Adjust these model imports to match your project ──
const {
  User, Student, Course, Enrollment,
  PlacementDrive, DriveApplication,
  Notification, Batch, InstituteFaculty,
} = require('../models');

// ── Auth middleware ──
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require login + institute role
router.use(authenticateToken);
router.use(authorizeRole(['institute', 'admin']));

// ─────────────────────────────────────────────
// HELPER — send in-app notification
// ─────────────────────────────────────────────
async function sendNotification(recipientId, title, message, data = {}) {
  try {
    await Notification.create({
      recipient_user_id: recipientId,
      title,
      message,
      data_json: JSON.stringify(data),
      is_read:   false,
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
}

// ─────────────────────────────────────────────
// DASHBOARD STATS
// GET /api/institute/dashboard/stats
// ─────────────────────────────────────────────
router.get('/dashboard/stats', async (req, res) => {
  try {
    const instituteId = req.user.id;

    const students  = await Student.findAll({ where: { institute_id: instituteId } });
    const studentUserIds = students.map(s => s.user_id);

    const courses      = await Course.findAll({ where: { institute_id: instituteId, status: 'approved' } });
    const facultyCount = await InstituteFaculty.count({ where: { institute_id: instituteId } });
    const batches      = await Batch.findAll({ where: { institute_id: instituteId } });
    const activeBatches = batches.filter(b => b.status === 'active').length;

    // Fee stats
    const now = new Date();
    const feeStats = students.reduce((acc, s) => {
      const thisMonth = new Date(s.createdAt).getMonth() === now.getMonth() &&
                        new Date(s.createdAt).getFullYear() === now.getFullYear();
      if (s.fee_status === 'paid' && thisMonth) acc.monthlyRevenue += parseFloat(s.fee_amount || 0);
      if (['pending', 'overdue'].includes(s.fee_status)) acc.pendingFees += parseFloat(s.fee_amount || 0);
      if (s.fee_status === 'overdue') acc.feeDefaulters++;
      return acc;
    }, { monthlyRevenue: 0, pendingFees: 0, feeDefaulters: 0 });

    // Placement stats
    let studentsPlaced = 0, placementRate = 0;
    if (studentUserIds.length) {
      studentsPlaced = await DriveApplication.count({ where: { student_id: { [Op.in]: studentUserIds }, status: 'selected' } });
      placementRate  = Math.round((studentsPlaced / students.length) * 100);
    }

    // Recent activity
    const recent = await Student.findAll({
      where:   { institute_id: instituteId },
      order:   [['createdAt', 'DESC']],
      limit:   8,
      include: [{ model: User, as: 'user', attributes: ['full_name'] }],
    });

    const activities = recent.map(s => ({
      title: `${s.user?.full_name || 'A student'} enrolled`,
      time:  new Date(s.createdAt).toLocaleString('en-IN'),
    }));

    res.json({
      success: true,
      stats: {
        totalStudents: students.length,
        activeCourses: courses.length,
        facultyCount,
        activeBatches,
        studentsPlaced,
        placementRate,
        ...feeStats,
      },
      activities,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// STUDENTS — 2.2
// ─────────────────────────────────────────────

// GET /api/institute/students
// Fields: id, name, email, batch_id, enrolled_courses[], avg_progress, attendance_avg, fee_status, placement_status
router.get('/students', async (req, res) => {
  try {
    const students = await Student.findAll({
      where:   { institute_id: req.user.id },
      order:   [['createdAt', 'DESC']],
      include: [
        { model: User,  as: 'user',  attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Batch, as: 'batch', attributes: ['id', 'name'] },
      ],
    });

    const result = await Promise.all(students.map(async s => {
      const enrollments = await Enrollment.findAll({ where: { user_id: s.user_id } });
      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0;

      const bestApp = await DriveApplication.findOne({
        where: { student_id: s.user_id },
        order: [['createdAt', 'DESC']],
      });

      return {
        id:               s.user?.id,
        full_name:        s.user?.full_name,
        email:            s.user?.email,
        phone:            s.user?.phone,
        batch_id:         s.batch_id,
        batch_name:       s.batch?.name,
        enrolled_courses: enrollments.length,
        avg_progress:     avgProgress,
        attendance_avg:   s.attendance || 0,
        fee_status:       s.fee_status || 'pending',
        fee_amount:       s.fee_amount || 0,
        placement_status: bestApp?.status || null,
        status:           s.status || 'active',
      };
    }));

    res.json({ success: true, students: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/institute/students — add one student manually
router.post('/students', async (req, res) => {
  try {
    const { full_name, email, phone, batch_id, fee_status } = req.body;
    if (!full_name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });

    const [user, created] = await User.findOrCreate({
      where:    { email },
      defaults: { full_name, phone, role: 'student', password: Math.random().toString(36).slice(-10), status: 'active' },
    });

    if (!created) return res.status(409).json({ success: false, message: 'A user with this email already exists' });

    await Student.create({
      user_id:      user.id,
      institute_id: req.user.id,
      batch_id:     batch_id || null,
      fee_status:   fee_status || 'pending',
      status:       'active',
    });

    await sendNotification(req.user.id, 'New Student Enrolled', `${full_name} has been enrolled under your institute.`, { student_id: user.id });

    res.json({
      success: true,
      student: {
        id: user.id, full_name: user.full_name, email: user.email,
        batch_id, fee_status: fee_status || 'pending',
        enrolled_courses: 0, avg_progress: 0, attendance_avg: 0,
        placement_status: null, status: 'active',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/institute/students/bulk — CSV upload
// CSV columns: full_name, email, phone, batch_name
router.post('/students/bulk', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });

    const lines   = req.file.buffer.toString('utf8').split('\n').map(l => l.trim()).filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows    = lines.slice(1);

    let created = 0;
    const errors = [];

    for (const row of rows) {
      const cols    = row.split(',').map(c => c.trim());
      const rowData = {};
      headers.forEach((h, i) => { rowData[h] = cols[i] || ''; });

      const { full_name, email, phone, batch_name } = rowData;
      if (!email || !full_name) { errors.push(`Skipped row — missing name or email`); continue; }

      try {
        const [user, userCreated] = await User.findOrCreate({
          where:    { email },
          defaults: { full_name, phone, role: 'student', password: Math.random().toString(36).slice(-10), status: 'active' },
        });

        if (!userCreated) { errors.push(`Skipped: ${email} already exists`); continue; }

        let batchId = null;
        if (batch_name) {
          const batch = await Batch.findOne({ where: { institute_id: req.user.id, name: batch_name } });
          if (batch) batchId = batch.id;
        }

        await Student.findOrCreate({
          where:    { user_id: user.id },
          defaults: { user_id: user.id, institute_id: req.user.id, batch_id: batchId, fee_status: 'pending', status: 'active' },
        });

        created++;
      } catch (rowErr) {
        errors.push(`Error for ${email}: ${rowErr.message}`);
      }
    }

    res.json({ success: true, created, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/institute/student/:id/status
router.patch('/student/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked', 'deactivated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const student = await Student.findOne({ where: { user_id: req.params.id, institute_id: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await student.update({ status });
    await User.update({ status }, { where: { id: req.params.id } });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institute/students/export
router.get('/students/export', async (req, res) => {
  try {
    const students = await Student.findAll({
      where:   { institute_id: req.user.id },
      include: [
        { model: User,  as: 'user',  attributes: ['full_name', 'email', 'phone'] },
        { model: Batch, as: 'batch', attributes: ['name'] },
      ],
    });

    const rows = ['Name,Email,Phone,Batch,Attendance,Fee Status,Status'];
    for (const s of students) {
      rows.push([s.user?.full_name || '', s.user?.email || '', s.user?.phone || '', s.batch?.name || '', `${s.attendance || 0}%`, s.fee_status || 'pending', s.status || 'active'].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(rows.join('\n'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// BATCHES — 2.3
// ─────────────────────────────────────────────

// GET /api/institute/batches
router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.findAll({ where: { institute_id: req.user.id }, order: [['createdAt', 'DESC']] });

    const result = await Promise.all(batches.map(async b => {
      const studentCount = await Student.count({ where: { institute_id: req.user.id, batch_id: b.id } });
      const facultyCount = await InstituteFaculty.count({ where: { institute_id: req.user.id, batch_id: b.id } });
      return { ...b.toJSON(), student_count: studentCount, faculty_count: facultyCount, course_count: (b.course_ids || []).length };
    }));

    res.json({ success: true, batches: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/institute/batch
// body: { name, course_ids[], faculty_assignments[{faculty_id,course_id}], start_date, end_date, student_ids[] }
router.post('/batch', async (req, res) => {
  try {
    const { name, start_date, end_date, course_ids, faculty_assignments, student_ids } = req.body;
    if (!name || !start_date) return res.status(400).json({ success: false, message: 'Batch name and start date are required' });

    const batch = await Batch.create({
      institute_id:        req.user.id,
      name,
      start_date,
      end_date:            end_date || null,
      course_ids:          course_ids          || [],
      faculty_assignments: faculty_assignments || [],
      timetable_json:      [],
      status:              'active',
    });

    if (student_ids?.length) {
      await Student.update({ batch_id: batch.id }, { where: { user_id: { [Op.in]: student_ids }, institute_id: req.user.id } });
    }

    res.json({
      success: true,
      batch: { ...batch.toJSON(), student_count: student_ids?.length || 0, faculty_count: faculty_assignments?.length || 0, course_count: course_ids?.length || 0 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// COURSES — 2.3
// ─────────────────────────────────────────────

// GET /api/institute/courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({ where: { institute_id: req.user.id }, order: [['createdAt', 'DESC']] });

    const result = await Promise.all(courses.map(async c => {
      const enrolled = await Enrollment.count({ where: { course_id: c.id } });
      return { ...c.toJSON(), enrolled_count: enrolled };
    }));

    res.json({ success: true, courses: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/institute/course — submits to admin for approval per 2.3
router.post('/course', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Course title is required' });

    const course = await Course.create({
      title,
      description:  description || '',
      category:     category    || '',
      institute_id: req.user.id,
      created_by:   req.user.id,
      status:       'pending',   // pending admin approval per requirement 2.3
      is_published: false,
    });

    res.json({ success: true, course: { ...course.toJSON(), enrolled_count: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// FACULTY
// GET /api/institute/faculty
// ─────────────────────────────────────────────
router.get('/faculty', async (req, res) => {
  try {
    const links = await InstituteFaculty.findAll({
      where:   { institute_id: req.user.id },
      include: [{ model: User, as: 'faculty', attributes: ['id', 'full_name', 'email'] }],
    });

    const result = await Promise.all(links.map(async f => {
      const batchCount = await InstituteFaculty.count({ where: { institute_id: req.user.id, faculty_id: f.faculty_id, batch_id: { [Op.ne]: null } } });
      return {
        id:          f.faculty_id,
        full_name:   f.faculty?.full_name,
        email:       f.faculty?.email,
        course_count: f.course_count || 0,
        batch_count:  batchCount,
      };
    }));

    res.json({ success: true, faculty: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// PLACEMENT TRACKER — 2.4 (read-only)
// GET /api/institute/placement-tracker
// ─────────────────────────────────────────────
router.get('/placement-tracker', async (req, res) => {
  try {
    const students = await Student.findAll({
      where:   { institute_id: req.user.id },
      include: [
        { model: User,  as: 'user',  attributes: ['id', 'full_name', 'email'] },
        { model: Batch, as: 'batch', attributes: ['name'] },
      ],
    });

    const statusPriority = ['selected', 'hr', 'r2', 'r1', 'shortlisted', 'applied', 'rejected'];

    const result = await Promise.all(students.map(async s => {
      const apps = await DriveApplication.findAll({
        where:   { student_id: s.user_id },
        include: [{ model: PlacementDrive, as: 'drive', attributes: ['company_name', 'package_lpa'] }],
        order:   [['createdAt', 'DESC']],
      });

      let bestApp = null;
      for (const p of statusPriority) { bestApp = apps.find(a => a.status === p); if (bestApp) break; }

      return {
        id:                s.user?.id,
        full_name:         s.user?.full_name,
        email:             s.user?.email,
        batch_name:        s.batch?.name || '—',
        application_count: apps.length,
        best_status:       bestApp?.status || null,
        selected_company:  bestApp?.status === 'selected' ? bestApp.drive?.company_name : null,
        package_lpa:       bestApp?.status === 'selected' ? bestApp.drive?.package_lpa  : null,
      };
    }));

    res.json({ success: true, students: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institute/placement-drives — view open drives (read-only per 2.4)
router.get('/placement-drives', async (req, res) => {
  try {
    const drives = await PlacementDrive.findAll({ order: [['createdAt', 'DESC']] });

    const withCounts = await Promise.all(drives.map(async d => {
      const apps             = await DriveApplication.findAll({ where: { drive_id: d.id } });
      return {
        ...d.toJSON(),
        applicant_count:   apps.length,
        shortlisted_count: apps.filter(a => ['shortlisted','r1','r2','hr'].includes(a.status)).length,
        offer_count:       apps.filter(a => a.status === 'selected').length,
      };
    }));

    res.json({ success: true, drives: withCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institute/placement-tracker/export
router.get('/placement-tracker/export', async (req, res) => {
  try {
    const students = await Student.findAll({
      where:   { institute_id: req.user.id },
      include: [
        { model: User,  as: 'user',  attributes: ['full_name', 'email'] },
        { model: Batch, as: 'batch', attributes: ['name'] },
      ],
    });

    const rows = ['Name,Email,Batch,Applications,Best Status,Company,Package'];
    const statusPriority = ['selected','hr','r2','r1','shortlisted','applied','rejected'];

    for (const s of students) {
      const apps = await DriveApplication.findAll({ where: { student_id: s.user_id }, include: [{ model: PlacementDrive, as: 'drive', attributes: ['company_name','package_lpa'] }], order: [['createdAt','DESC']] });
      let bestApp = null;
      for (const p of statusPriority) { bestApp = apps.find(a => a.status === p); if (bestApp) break; }

      rows.push([
        s.user?.full_name || '',
        s.user?.email     || '',
        s.batch?.name     || '',
        apps.length,
        bestApp?.status   || 'not applied',
        bestApp?.status === 'selected' ? bestApp.drive?.company_name || '' : '',
        bestApp?.status === 'selected' ? (bestApp.drive?.package_lpa ? `${bestApp.drive.package_lpa} LPA` : '') : '',
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=placement-report.csv');
    res.send(rows.join('\n'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────
// ANALYTICS — 2.5
// GET /api/institute/analytics
// ─────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const instituteId    = req.user.id;
    const students       = await Student.findAll({ where: { institute_id: instituteId }, include: [{ model: Batch, as: 'batch', attributes: ['id','name'] }] });
    const studentUserIds = students.map(s => s.user_id);
    const courses        = await Course.findAll({ where: { institute_id: instituteId } });
    const batches        = await Batch.findAll({ where: { institute_id: instituteId } });

    const activeStudents = students.filter(s => s.status === 'active').length;

    // Placement rate
    let totalPlaced = 0;
    if (studentUserIds.length) {
      totalPlaced = await DriveApplication.count({ where: { student_id: { [Op.in]: studentUserIds }, status: 'selected' } });
    }
    const placementRate = students.length > 0 ? Math.round((totalPlaced / students.length) * 100) : 0;

    // Avg course completion
    let avgCompletion = 0;
    if (studentUserIds.length) {
      const enrollments = await Enrollment.findAll({ where: { user_id: { [Op.in]: studentUserIds } } });
      if (enrollments.length) avgCompletion = Math.round(enrollments.reduce((s, e) => s + (e.progress || 0), 0) / enrollments.length);
    }

    // Fee stats
    const feeStats = students.reduce((acc, s) => {
      const amt = parseFloat(s.fee_amount || 0);
      if (s.fee_status === 'paid')    acc.collected += amt;
      if (s.fee_status === 'pending') acc.pending   += amt;
      if (s.fee_status === 'overdue') acc.overdue   += amt;
      return acc;
    }, { collected: 0, pending: 0, overdue: 0 });

    // Course stats — completion + dropout rate
    const courseStats = await Promise.all(courses.map(async c => {
      const enrollments = await Enrollment.findAll({ where: { course_id: c.id } });
      const enrolled    = enrollments.length;
      const completed   = enrollments.filter(e => e.status === 'completed').length;
      const dropped     = enrollments.filter(e => e.status === 'dropped').length;
      return {
        title:      c.title,
        enrolled,
        completion: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
        dropout:    enrolled > 0 ? Math.round((dropped   / enrolled) * 100) : 0,
      };
    }));

    // Batch-wise placement report
    const batchPlacement = await Promise.all(batches.map(async b => {
      const batchStudents  = students.filter(s => s.batch_id === b.id);
      const batchUserIds   = batchStudents.map(s => s.user_id);
      let applied = 0, selected = 0, avgPackage = null;

      if (batchUserIds.length) {
        const apps    = await DriveApplication.findAll({ where: { student_id: { [Op.in]: batchUserIds } }, include: [{ model: PlacementDrive, as: 'drive', attributes: ['package_lpa'] }] });
        applied       = apps.length;
        const selApps = apps.filter(a => a.status === 'selected');
        selected      = selApps.length;
        if (selApps.length) {
          const total  = selApps.reduce((s, a) => s + parseFloat(a.drive?.package_lpa || 0), 0);
          avgPackage   = (total / selApps.length).toFixed(1);
        }
      }

      return {
        batch:       b.name,
        students:    batchStudents.length,
        applied,
        selected,
        rate:        batchStudents.length > 0 ? Math.round((selected / batchStudents.length) * 100) : 0,
        avg_package: avgPackage,
      };
    }));

    res.json({
      success: true,
      analytics: {
        placementRate, avgCompletion, activeStudents,
        feeCollected: feeStats.collected, feeStats,
        courseStats, batchPlacement,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/institute/analytics/export
router.get('/analytics/export', async (req, res) => {
  try {
    const students = await Student.findAll({
      where:   { institute_id: req.user.id },
      include: [
        { model: User,  as: 'user',  attributes: ['full_name', 'email'] },
        { model: Batch, as: 'batch', attributes: ['name'] },
      ],
    });

    const rows = ['Name,Email,Batch,Attendance,Fee Status,Placement Status'];
    for (const s of students) {
      const app = await DriveApplication.findOne({ where: { student_id: s.user_id }, order: [['createdAt','DESC']] });
      rows.push([s.user?.full_name || '', s.user?.email || '', s.batch?.name || '', `${s.attendance || 0}%`, s.fee_status || 'pending', app?.status || 'not applied'].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
    res.send(rows.join('\n'));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;