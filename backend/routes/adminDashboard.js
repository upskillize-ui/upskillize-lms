const express = require('express');
const router = express.Router();
const { User, Student, Faculty, Course, Enrollment, Payment, sequelize } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { Op } = require('sequelize');

// Apply authentication and admin check to all routes
router.use(authMiddleware);
router.use(rbac(['admin']));

// Dashboard Statistics
router.get('/stats', async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.count();
    
    // Total Students
    const totalStudents = await Student.count();
    
    // Total Faculty
    const totalFaculty = await Faculty.count();
    
    // Total Courses
    const totalCourses = await Course.count();
    
    // Total Enrollments
    const totalEnrollments = await Enrollment.count();
    
    // Active Enrollments
    const activeEnrollments = await Enrollment.count({
      where: { completion_status: 'in_progress' }
    });
    
    // Completed Enrollments
    const completedEnrollments = await Enrollment.count({
      where: { completion_status: 'completed' }
    });
    
    // Total Revenue
    const totalRevenue = await Payment.sum('amount', {
      where: { payment_status: 'completed' }
    }) || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalCourses,
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard statistics' 
    });
  }
});

// Get All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expiry'] },
      include: [
        { model: Student, attributes: ['id', 'enrollment_number'] },
        { model: Faculty, attributes: ['id', 'employee_id'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users' 
    });
  }
});

// Get All Students with Enrollment Count
router.get('/students', async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone', 'created_at']
        },
        {
          model: Enrollment,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('Enrollments.id')), 'enrollment_count']
        ]
      },
      group: ['Student.id', 'User.id'],
      order: [[User, 'created_at', 'DESC']]
    });

    // Format the response
    const formattedStudents = students.map(student => ({
      id: student.User.id,
      full_name: student.User.full_name,
      email: student.User.email,
      phone_number: student.User.phone,
      created_at: student.User.created_at,
      enrollment_number: student.enrollment_number,
      date_of_birth: student.date_of_birth,
      enrollment_count: student.get('enrollment_count') || 0
    }));

    res.json({
      success: true,
      data: formattedStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching students' 
    });
  }
});

// Get All Faculty with Course Count
router.get('/faculty', async (req, res) => {
  try {
    const faculty = await Faculty.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone', 'created_at']
        },
        {
          model: Course,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('Courses.id')), 'course_count']
        ]
      },
      group: ['Faculty.id', 'User.id'],
      order: [[User, 'created_at', 'DESC']]
    });

    // Format the response
    const formattedFaculty = faculty.map(f => ({
      id: f.User.id,
      full_name: f.User.full_name,
      email: f.User.email,
      phone: f.User.phone,
      created_at: f.User.created_at,
      employee_id: f.employee_id,
      specialization: f.specialization,
      bio: f.bio,
      course_count: f.get('course_count') || 0
    }));

    res.json({
      success: true,
      data: formattedFaculty
    });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching faculty' 
    });
  }
});

// Get All Payments
router.get('/payments', async (req, res) => {
  try {
    // Payment model: user_id (not student_id), status (not payment_status), payment_id/order_id
    const payments = await Payment.findAll({
      include: [
        { model: User, attributes: ['full_name', 'email'], required: false },
        { model: Course, attributes: ['course_name'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      transaction_id: payment.payment_id || payment.order_id || `TXN-${payment.id}`,
      amount: parseFloat(payment.amount || 0),
      // Map 'created' → 'pending' for frontend display
      payment_status: payment.status === 'created' ? 'pending' : (payment.status || 'pending'),
      payment_date: payment.updated_at || payment.created_at,
      student_name: payment.User?.full_name || payment.User?.email || 'N/A',
      course_name: payment.Course?.course_name || 'N/A',
      gateway: payment.payment_method || 'razorpay',
    }));

    res.json({
      success: true,
      payments: formattedPayments,
      data: formattedPayments
    });
  } catch (error) {
    console.error('Error fetching payments:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching payments: ' + error.message
    });
  }
});

// Get Analytics Data
router.get('/analytics', async (req, res) => {
  try {
    // Top Performing Courses
    const topCourses = await Course.findAll({
      include: [
        {
          model: Enrollment,
          attributes: []
        },
        {
          model: Payment,
          attributes: [],
          where: { payment_status: 'completed' },
          required: false
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('Enrollments.id')), 'enrollment_count'],
          [sequelize.fn('SUM', sequelize.col('Payments.amount')), 'total_revenue']
        ]
      },
      group: ['Course.id'],
      order: [[sequelize.literal('enrollment_count'), 'DESC']],
      limit: 5
    });

    const formattedTopCourses = topCourses.map(course => ({
      course_name: course.course_name,
      enrollment_count: course.get('enrollment_count') || 0,
      total_revenue: course.get('total_revenue') || 0
    }));

    // Revenue by Month (Last 6 months)
    const revenueByMonth = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('paid_at'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue']
      ],
      where: {
        payment_status: 'completed',
        paid_at: {
          [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 6 MONTH)')
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('paid_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('paid_at'), '%Y-%m'), 'DESC']],
      raw: true
    });

    // Enrollment Trends (Last 30 days)
    const enrollmentTrends = await Enrollment.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', '*'), 'enrollments']
      ],
      where: {
        created_at: {
          [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)')
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        topCourses: formattedTopCourses,
        revenueByMonth,
        enrollmentTrends
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching analytics' 
    });
  }
});

// Get Student Details by ID
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findOne({
      include: [
        {
          model: User,
          where: { id: req.params.id }
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Get student enrollments
    const enrollments = await Enrollment.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Course,
          attributes: ['course_name']
        },
        {
          model: Payment,
          attributes: ['amount', 'payment_status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student.User.id,
          full_name: student.User.full_name,
          email: student.User.email,
          phone_number: student.User.phone,
          created_at: student.User.created_at,
          enrollment_number: student.enrollment_number,
          date_of_birth: student.date_of_birth,
          address: student.address
        },
        enrollments: enrollments.map(e => ({
          course_name: e.Course?.course_name,
          enrolled_at: e.created_at,
          status: e.completion_status,
          progress: e.progress_percentage,
          amount: e.Payment?.amount,
          payment_status: e.payment_status
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching student details' 
    });
  }
});

// Get Faculty Details by ID
router.get('/faculty/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      include: [
        {
          model: User,
          where: { id: req.params.id }
        }
      ]
    });

    if (!faculty) {
      return res.status(404).json({ 
        success: false,
        message: 'Faculty not found' 
      });
    }

    // Get faculty courses
    const courses = await Course.findAll({
      where: { faculty_id: faculty.id },
      include: [
        {
          model: Enrollment,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('Enrollments.id')), 'enrollment_count']
        ]
      },
      group: ['Course.id'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        faculty: {
          id: faculty.User.id,
          full_name: faculty.User.full_name,
          email: faculty.User.email,
          created_at: faculty.User.created_at,
          employee_id: faculty.employee_id,
          specialization: faculty.specialization,
          bio: faculty.bio,
          experience_years: faculty.experience_years
        },
        courses: courses.map(c => ({
          id: c.id,
          course_name: c.course_name,
          course_code: c.course_code,
          category: c.category,
          price: c.price,
          enrollment_count: c.get('enrollment_count') || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching faculty details' 
    });
  }
});

// Update User Status (Activate/Deactivate)
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { is_active } = req.body;
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.is_active = is_active;
    await user.save();

    res.json({ 
      success: true,
      message: 'User status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user status' 
    });
  }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Don't allow deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete your own account' 
      });
    }

    await user.destroy();
    
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user' 
    });
  }
});

module.exports = router;