const express = require('express');
const router = express.Router();
const { Course, Faculty, User, CourseModule, Lesson, Enrollment } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { Op } = require('sequelize');

// Get all courses with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, difficulty_level, min_price, max_price } = req.query;
    
    const where = { is_active: true };
    
    if (category) where.category = category;
    if (difficulty_level) where.difficulty_level = difficulty_level;
    if (search) {
      where[Op.or] = [
        { course_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (min_price) where.price = { [Op.gte]: min_price };
    if (max_price) where.price = { ...where.price, [Op.lte]: max_price };

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: Faculty,
          include: [{ model: User, attributes: ['full_name', 'email'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

// Get course by ID with modules and lessons
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: Faculty,
          include: [{ model: User, attributes: ['full_name', 'email', 'profile_photo'] }]
        },
        {
          model: CourseModule,
          include: [{ model: Lesson }],
          order: [['sequence_order', 'ASC']]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Error fetching course' });
  }
});

// Create course (Faculty/Admin only)
router.post('/', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const {
      course_name, course_code, description, category, duration_hours,
      price, thumbnail, difficulty_level, language, prerequisites, learning_outcomes
    } = req.body;

    const course = await Course.create({
      course_name,
      course_code,
      description,
      category,
      duration_hours,
      price,
      thumbnail,
      difficulty_level,
      language,
      prerequisites,
      learning_outcomes,
      faculty_id: req.user.roleDataId
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Error creating course', error: error.message });
  }
});

// Update course
router.put('/:id', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'faculty' && course.faculty_id !== req.user.roleDataId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    await course.update(req.body);
    res.json({ success: true, message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Error updating course' });
  }
});

// Delete course (Admin only)
router.delete('/:id', authMiddleware, rbac(['admin']), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await course.destroy();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Error deleting course' });
  }
});

module.exports = router;
