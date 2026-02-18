const express = require('express');
const router = express.Router();
const { Lesson, CourseModule, Enrollment } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const jwt = require('jsonwebtoken');

router.post('/', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating lesson' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: CourseModule }]
    });
    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching lesson' });
  }
});

router.post('/:id/access', authMiddleware, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: CourseModule }]
    });

    if (lesson.is_preview) {
      return res.json({ success: true, allowed: true, videoId: lesson.youtube_video_id });
    }

    const enrollment = await Enrollment.findOne({
      where: { 
        student_id: req.user.roleDataId,
        course_id: lesson.CourseModule.course_id,
        payment_status: 'paid'
      }
    });

    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    const token = jwt.sign(
      { lessonId: lesson.id, userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ success: true, token, videoId: lesson.youtube_video_id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking access' });
  }
});

module.exports = router;
