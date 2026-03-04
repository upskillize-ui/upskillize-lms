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

// ============================================================
// TEMP SEED ROUTE — DELETE AFTER USE
// Visit: /api/courses/seed-production once after deploy
// ============================================================
router.get('/seed-production', async (req, res) => {
  try {
    await Course.bulkCreate([
      {
        course_name: 'Banking Foundation',
        course_code: 'BANK-FOUND-001',
        description: '4-part video course covering banking fundamentals, products, lending and compliance.',
        category: 'Banking & Finance',
        is_active: true,
        price: 0.00
      },
      {
        course_name: 'Banking Foundation - Part 1: Banking Basics',
        course_code: 'BANK-FOUND-001-P1',
        description: 'Introduction to banking fundamentals and core concepts.',
        category: 'Banking & Finance',
        is_active: true,
        price: 0.00
      },
      {
        course_name: 'Banking Foundation - Part 2: Products & Services',
        course_code: 'BANK-FOUND-001-P2',
        description: 'Overview of banking products, accounts and services.',
        category: 'Banking & Finance',
        is_active: true,
        price: 0.00
      },
      {
        course_name: 'Banking Foundation - Part 3: Lending & Payments',
        course_code: 'BANK-FOUND-001-P3',
        description: 'Understanding lending, loans and payment systems.',
        category: 'Banking & Finance',
        is_active: true,
        price: 0.00
      },
      {
        course_name: 'Banking Foundation - Part 4: Compliance & Risk',
        course_code: 'BANK-FOUND-001-P4',
        description: 'Banking compliance, regulations and risk management.',
        category: 'Banking & Finance',
        is_active: true,
        price: 0.00
      },
    ], { ignoreDuplicates: true });

    res.json({ success: true, message: 'Courses seeded to production successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: error.message });
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