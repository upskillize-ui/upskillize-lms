const express = require('express');
const router = express.Router();
const { Enrollment, Student, Course, Faculty, User } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Enroll in a course
router.post('/', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const { course_id } = req.body;
    
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      where: { student_id: req.user.roleDataId, course_id }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    if (course.price > 0) {
      return res.json({
        success: false,
        requiresPayment: true,
        message: 'Payment required',
        course_id,
        amount: course.price
      });
    }

    const enrollment = await Enrollment.create({
      student_id: req.user.roleDataId,
      course_id,
      payment_status: 'paid'
    });

    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Error enrolling in course' });
  }
});

// Get student's enrollments
router.get('/my-enrollments', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { student_id: req.user.roleDataId },
      include: [
        {
          model: Course,
          include: [{ model: Faculty, include: [User] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching enrollments' });
  }
});

// Update lesson progress
router.patch('/:id/progress', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { id: req.params.id, student_id: req.user.roleDataId }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const { completed_lessons, total_lessons } = req.body;

    // Calculate progress percentage
    const progress = total_lessons > 0
      ? Math.round((completed_lessons / total_lessons) * 100)
      : 0;

    enrollment.progress_percentage = progress;

    // Mark as completed if 100%
    if (progress === 100) {
      enrollment.completion_status = 'completed';
      enrollment.completed_at = new Date();
    } else if (progress > 0) {
      enrollment.completion_status = 'in_progress';
    }

    await enrollment.save();

    res.json({ success: true, message: 'Progress updated', enrollment });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ success: false, message: 'Error updating progress' });
  }
});

// Withdraw from course
router.delete('/:id', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { id: req.params.id, student_id: req.user.roleDataId }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    enrollment.completion_status = 'withdrawn';
    await enrollment.save();

    res.json({ success: true, message: 'Withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ success: false, message: 'Error withdrawing from course' });
  }
});

module.exports = router;
