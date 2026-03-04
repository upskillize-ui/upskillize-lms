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
// Adds 4 video modules to Banking Foundation (course id=1)
// Visit: /api/courses/seed-videos once after deploy
// ============================================================
router.get('/seed-videos', async (req, res) => {
  try {
    // Find Banking Foundation main course
    const course = await Course.findOne({ where: { course_code: 'BANK-FOUND-001' } });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Banking Foundation course not found' });
    }

    // Hide the 4 sub-part courses (they are redundant now)
    await Course.update(
      { is_active: false },
      { where: { course_code: { [Op.like]: 'BANK-FOUND-001-P%' } } }
    );

    // Create 4 modules inside Banking Foundation
    const modules = [
      {
        course_id: course.id,
        module_name: 'Module 1: Banking Basics',
        description: 'Introduction to banking fundamentals and core concepts.',
        sequence_order: 1
      },
      {
        course_id: course.id,
        module_name: 'Module 2: Products & Services',
        description: 'Overview of banking products, accounts and services.',
        sequence_order: 2
      },
      {
        course_id: course.id,
        module_name: 'Module 3: Lending & Payments',
        description: 'Understanding lending, loans and payment systems.',
        sequence_order: 3
      },
      {
        course_id: course.id,
        module_name: 'Module 4: Compliance & Risk',
        description: 'Banking compliance, regulations and risk management.',
        sequence_order: 4
      }
    ];

    const createdModules = await CourseModule.bulkCreate(modules, { ignoreDuplicates: false });

    // Create 1 video lesson per module
    const lessons = [
      {
        course_module_id: createdModules[0].id,
        lesson_name: 'Banking Basics - Full Video',
        description: 'Introduction to banking fundamentals and core concepts.',
        sequence_order: 1,
        content_type: 'video',
        youtube_video_id: 'y3HKCaLPqtU',
        content_url: 'https://www.youtube.com/watch?v=y3HKCaLPqtU',
        is_preview: true
      },
      {
        course_module_id: createdModules[1].id,
        lesson_name: 'Products & Services - Full Video',
        description: 'Overview of banking products, accounts and services.',
        sequence_order: 1,
        content_type: 'video',
        youtube_video_id: 'cPHKvABl9s4',
        content_url: 'https://www.youtube.com/watch?v=cPHKvABl9s4',
        is_preview: false
      },
      {
        course_module_id: createdModules[2].id,
        lesson_name: 'Lending & Payments - Full Video',
        description: 'Understanding lending, loans and payment systems.',
        sequence_order: 1,
        content_type: 'video',
        youtube_video_id: 'BM9ShEKAgVY',
        content_url: 'https://www.youtube.com/watch?v=BM9ShEKAgVY',
        is_preview: false
      },
      {
        course_module_id: createdModules[3].id,
        lesson_name: 'Compliance & Risk - Full Video',
        description: 'Banking compliance, regulations and risk management.',
        sequence_order: 1,
        content_type: 'video',
        youtube_video_id: 'Ap7Gk2Nj52c',
        content_url: 'https://www.youtube.com/watch?v=Ap7Gk2Nj52c',
        is_preview: false
      }
    ];

    await Lesson.bulkCreate(lessons);

    res.json({
      success: true,
      message: 'Videos seeded successfully! Banking Foundation now has 4 video modules.',
      course_id: course.id,
      modules_created: createdModules.length,
      lessons_created: lessons.length
    });
  } catch (error) {
    console.error('Seed videos error:', error);
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