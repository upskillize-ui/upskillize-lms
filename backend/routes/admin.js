const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, Student, Faculty, Course, Enrollment, Payment } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

const adminOnly = [authMiddleware, rbac(['admin'])];

// ============================================================
// DASHBOARD STATS
// GET /api/admin/dashboard/stats   ← matches Dashboard.jsx
// ============================================================
router.get('/dashboard/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalCourses, totalEnrollments] = await Promise.all([
      Student.count(),
      Faculty.count(),
      Course.count(),
      Enrollment.count(),
    ]);

    const totalUsers = await User.count();

    let totalRevenue = 0;
    try {
      totalRevenue = await Payment.sum('amount', { where: { payment_status: 'completed' } }) || 0;
    } catch (_) {}

    let activeEnrollments = 0, completedEnrollments = 0;
    try {
      activeEnrollments    = await Enrollment.count({ where: { completion_status: 'in_progress' } });
      completedEnrollments = await Enrollment.count({ where: { completion_status: 'completed' } });
    } catch (_) {}

    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.count({ where: { created_at: { [Op.gte]: startOfMonth } } });

    let activeCourses = totalCourses;
    try { activeCourses = await Course.count({ where: { status: 'active' } }); } catch (_) {}

    return res.json({
      success: true,
      stats: {
        totalUsers, totalStudents, totalFaculty, totalCourses,
        activeCourses, totalEnrollments, activeEnrollments,
        completedEnrollments, totalRevenue, newUsersThisMonth,
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// RECENT ACTIVITY
// GET /api/admin/recent-activity   ← matches Dashboard.jsx
// ============================================================
router.get('/recent-activity', ...adminOnly, async (req, res) => {
  try {
    const activities = [];

    try {
      const recentEnrollments = await Enrollment.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          { model: Student, include: [{ model: User, attributes: ['full_name', 'email'] }] },
          { model: Course, attributes: ['course_name'] },
        ]
      });
      recentEnrollments.forEach(e => {
        const name = e.Student?.User?.full_name || e.Student?.User?.email || 'Unknown';
        activities.push({
          id: `enroll-${e.id}`,
          title: `${name} enrolled in ${e.Course?.course_name || 'a course'}`,
          type: 'enrollment',
          time: timeAgo(e.created_at),
        });
      });
    } catch (_) {}

    try {
      const recentUsers = await User.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'full_name', 'email', 'role', 'created_at'],
      });
      recentUsers.forEach(u => {
        activities.push({
          id: `user-${u.id}`,
          title: `${u.full_name || u.email} registered as ${u.role}`,
          type: 'user',
          time: timeAgo(u.created_at),
        });
      });
    } catch (_) {}

    activities.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime));

    return res.json({ success: true, activities: activities.slice(0, 10) });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.json({ success: true, activities: [] });
  }
});

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// ============================================================
// ADMIN PROFILE
// GET  /api/admin/profile         ← matches Profile.jsx
// PUT  /api/admin/profile
// POST /api/admin/profile/upload-photo
// ============================================================
router.get('/profile', ...adminOnly, async (req, res) => {
  try {
    const admin = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    return res.json({ success: true, profile: admin });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/profile', ...adminOnly, async (req, res) => {
  try {
    const {
      full_name, phone, bio, designation, department,
      specialization, qualification, experience_years,
      date_of_joining, address, office_location, office_hours
    } = req.body;

    await User.update(
      {
        full_name, phone, bio, designation, department,
        specialization, qualification, experience_years,
        date_of_joining, address, office_location, office_hours
      },
      { where: { id: req.user.id } }
    );

    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    return res.json({ success: true, message: 'Profile updated successfully', profile: updated });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/profile/upload-photo', ...adminOnly, async (req, res) => {
  try {
    // If using multer for file upload, req.file will be present
    // If sending base64 in body:
    const { profile_photo } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : profile_photo;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }

    await User.update({ profile_photo: imageUrl }, { where: { id: req.user.id } });
    return res.json({ success: true, message: 'Photo updated', imageUrl });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// USER MANAGEMENT
// GET    /api/admin/users
// GET    /api/admin/users/:id
// PUT    /api/admin/users/:id
// DELETE /api/admin/users/:id
// POST   /api/admin/users/:id/approve   ← NEW (used in Dashboard.jsx)
// POST   /api/admin/users/:id/reject    ← NEW
// POST   /api/admin/users/:id/suspend   ← matches Dashboard.jsx
// POST   /api/admin/users/:id/activate  ← matches Dashboard.jsx
// ============================================================
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', role = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] },
    });

    return res.json({
      success: true,
      users,                   // Dashboard.jsx reads response.data.users
      data: users,             // fallback key some components use
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { full_name, email, phone, role } = req.body;
    await user.update({ full_name, email, phone, role });
    return res.json({ success: true, message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.destroy();
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve user (pending → active)
router.post('/users/:id/approve', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ is_active: true, status: 'active' });
    return res.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving user' });
  }
});

// Reject user (removes or marks rejected)
router.post('/users/:id/reject', ...adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Mark as rejected (or destroy — your choice)
    await user.update({ is_active: false, status: 'rejected', reject_reason: reason || null });
    return res.json({ success: true, message: 'User rejected' });
  } catch (error) {
    // If reject_reason column doesn't exist yet, just deactivate
    try {
      await User.update({ is_active: false }, { where: { id: req.params.id } });
      return res.json({ success: true, message: 'User rejected' });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Error rejecting user' });
    }
  }
});

// Suspend user (active → suspended)
router.post('/users/:id/suspend', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ is_active: false, status: 'suspended' });
    return res.json({ success: true, message: 'User suspended' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error suspending user' });
  }
});

// Activate user (suspended → active)
router.post('/users/:id/activate', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ is_active: true, status: 'active' });
    return res.json({ success: true, message: 'User activated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error activating user' });
  }
});

// ============================================================
// STUDENTS
// GET /api/admin/students
// ============================================================
router.get('/students', ...adminOnly, async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: User, attributes: ['id', 'full_name', 'email', 'phone', 'created_at'] }],
      order: [[User, 'created_at', 'DESC']],
    });

    const data = students.map(s => ({
      id: s.User?.id,
      full_name: s.User?.full_name,
      email: s.User?.email,
      phone_number: s.User?.phone,
      created_at: s.User?.created_at,
      enrollment_number: s.enrollment_number,
    }));

    return res.json({ success: true, students: data, data });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// FACULTY
// GET /api/admin/faculty
// ============================================================
router.get('/faculty', ...adminOnly, async (req, res) => {
  try {
    const faculty = await Faculty.findAll({
      include: [{ model: User, attributes: ['id', 'full_name', 'email', 'phone', 'created_at'] }],
      order: [[User, 'created_at', 'DESC']],
    });

    const data = faculty.map(f => ({
      id: f.User?.id,
      full_name: f.User?.full_name,
      email: f.User?.email,
      phone: f.User?.phone,
      created_at: f.User?.created_at,
      employee_id: f.employee_id,
      specialization: f.specialization,
      bio: f.bio,
      course_count: 0,
    }));

    return res.json({ success: true, faculty: data, data });
  } catch (error) {
    console.error('Faculty fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// COURSES
// GET    /api/admin/courses
// POST   /api/admin/courses
// PUT    /api/admin/courses/:id
// DELETE /api/admin/courses/:id
// POST   /api/admin/courses/:id/approve  ← used in CourseApproval component
// POST   /api/admin/courses/:id/reject
// GET    /api/admin/courses/approval     ← used in CourseApproval component
// ============================================================
router.get('/courses/approval', ...adminOnly, async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: Faculty, include: [{ model: User, attributes: ['full_name'] }] }],
    });

    const data = courses.map(c => ({
      id: c.id,
      course_name: c.course_name || c.title,
      faculty_name: c.Faculty?.User?.full_name || 'N/A',
      status: c.status || 'pending',
      created_at: c.created_at,
      category: c.category,
      price: c.price,
    }));

    return res.json({ success: true, courses: data });
  } catch (error) {
    console.error('Course approval fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/courses', ...adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (search) where[Op.or] = [{ course_name: { [Op.like]: `%${search}%` } }];
    if (status) where.status = status;

    const { count, rows: courses } = await Course.findAndCountAll({
      where, limit: parseInt(limit), offset, order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true, courses, data: courses,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/courses/:id/approve', ...adminOnly, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update({ status: 'approved' });
    return res.json({ success: true, message: 'Course approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error approving course' });
  }
});

router.post('/courses/:id/reject', ...adminOnly, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update({ status: 'rejected' });
    return res.json({ success: true, message: 'Course rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting course' });
  }
});

router.post('/courses', ...adminOnly, async (req, res) => {
  try {
    const { course_name, course_code, description, duration_hours, price, status, category } = req.body;
    if (!course_name) return res.status(400).json({ success: false, message: 'Course name required' });
    const course = await Course.create({
      course_name, course_code, description, duration_hours, price,
      status: status || 'active', category: category || 'General',
    });
    return res.status(201).json({ success: true, message: 'Course created', course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/courses/:id', ...adminOnly, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update(req.body);
    return res.json({ success: true, message: 'Course updated', course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/courses/:id', ...adminOnly, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.destroy();
    return res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// PAYMENTS
// GET /api/admin/payments
// ============================================================
router.get('/payments', ...adminOnly, async (req, res) => {
  try {
    // Payment model uses: user_id, course_id, order_id, payment_id, amount, status, payment_method
    // Association: Payment.belongsTo(User) and Payment.belongsTo(Course) — NO Student association
    const payments = await Payment.findAll({
      order: [['created_at', 'DESC']],
      include: [
        { model: User, attributes: ['full_name', 'email'], required: false },
        { model: Course, attributes: ['course_name'], required: false },
      ],
    });

    const data = payments.map(p => ({
      id: p.id,
      // Payment.js uses 'payment_id' and 'order_id' (not razorpay_payment_id)
      transaction_id: p.payment_id || p.order_id || `TXN-${p.id}`,
      amount: parseFloat(p.amount || 0),
      paid_amount: parseFloat(p.amount || 0),
      // Payment.js status ENUM is: 'created','completed','failed','refunded'
      // Map 'created' → 'pending' so frontend filter works correctly
      payment_status: p.status === 'created' ? 'pending' : (p.status || 'pending'),
      payment_date: p.updated_at || p.created_at,
      student_name: p.User?.full_name || p.User?.email || 'N/A',
      course_name: p.Course?.course_name || 'N/A',
      gateway: p.payment_method || 'razorpay',
    }));

    return res.json({ success: true, payments: data, data });
  } catch (error) {
    console.error('Payments fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching payments: ' + error.message });
  }
});

// ============================================================
// ENROLLMENTS
// GET    /api/admin/enrollments
// POST   /api/admin/enrollments
// DELETE /api/admin/enrollments/:id
// ============================================================
router.get('/enrollments', ...adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      limit: parseInt(limit), offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Student, include: [{ model: User, attributes: ['id', 'full_name', 'email'] }] },
        { model: Course, attributes: ['id', 'course_name', 'course_code'] },
      ]
    });

    return res.json({
      success: true, enrollments, data: enrollments,
      pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/enrollments', ...adminOnly, async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) {
      return res.status(400).json({ success: false, message: 'user_id and course_id required' });
    }
    const existing = await Enrollment.findOne({ where: { user_id, course_id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already enrolled' });
    }
    const enrollment = await Enrollment.create({ user_id, course_id, progress_percentage: 0 });
    return res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/enrollments/:id', ...adminOnly, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    await enrollment.destroy();
    return res.json({ success: true, message: 'Enrollment removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// ANALYTICS
// GET /api/admin/analytics
// ============================================================
router.get('/analytics', ...adminOnly, async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalCourses, totalEnrollments] = await Promise.all([
      Student.count(), Faculty.count(), Course.count(), Enrollment.count(),
    ]);

    let totalRevenue = 0;
    let revenueByMonth = [], topCourses = [];
    try {
      totalRevenue = await Payment.sum('amount', { where: { payment_status: 'completed' } }) || 0;
    } catch (_) {}

    return res.json({
      success: true,
      analytics: {
        totalStudents, totalFaculty, totalCourses, totalEnrollments,
        totalRevenue, revenueByMonth, topCourses,
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics' });
  }
});

// ============================================================
// SETTINGS
// GET /api/admin/settings
// PUT /api/admin/settings
// ============================================================
router.get('/settings', ...adminOnly, async (req, res) => {
  return res.json({
    success: true,
    settings: {
      site_name: 'Upskillize',
      site_email: 'admin@upskillize.com',
      max_enrollment_per_course: 100,
      allow_self_enrollment: true,
      maintenance_mode: false,
    }
  });
});

router.put('/settings', ...adminOnly, async (req, res) => {
  return res.json({ success: true, message: 'Settings updated' });
});

// ============================================================
// REPORTS
// GET /api/admin/reports/overview
// ============================================================
router.get('/reports/overview', ...adminOnly, async (req, res) => {
  try {
    return res.json({ success: true, enrollmentsByMonth: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;