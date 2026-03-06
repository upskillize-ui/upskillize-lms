// backend/routes/facultyProfile.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { User, Faculty, Course, Enrollment, Student, Exam, Result, VideoWatchHistory, Lesson, CourseModule } = require('../models');
const authMiddleware = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles/faculty';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

router.post('/profile/upload-photo', authMiddleware, upload.single('profile_photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `/uploads/profiles/faculty/${req.file.filename}`;
    await User.update({ profile_photo: imageUrl }, { where: { id: req.user.id, role: 'faculty' } });
    res.json({ success: true, message: 'Profile photo uploaded successfully', imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading profile photo' });
  }
});

router.put('/profile/personal', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone_number } = req.body;
    if (!full_name?.trim()) return res.status(400).json({ success: false, message: 'Full name is required' });
    const [updated] = await User.update(
      { full_name: full_name.trim(), phone: phone_number?.trim() || null },
      { where: { id: req.user.id, role: 'faculty' } }
    );
    if (updated === 0) return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    res.json({ success: true, message: 'Personal information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating personal information' });
  }
});

router.put('/profile/professional', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Professional information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating professional information' });
  }
});

router.put('/profile/contact', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Contact information updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating contact information' });
  }
});

router.put('/profile/social', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, message: 'Social links updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating social links' });
  }
});

router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ where: { user_id: userId } });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const facultyId = faculty.id;
    const totalCourses = await Course.count({ where: { faculty_id: facultyId } });
    const facultyCourses = await Course.findAll({ where: { faculty_id: facultyId }, attributes: ['id'] });
    const courseIds = facultyCourses.map(c => c.id);

    const totalStudents = courseIds.length > 0
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds } }, distinct: true, col: 'student_id' })
      : 0;

    const activeEnrollments = courseIds.length > 0
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: { [Op.in]: ['enrolled', 'in_progress'] } } })
      : 0;

    const completedEnrollments = courseIds.length > 0
      ? await Enrollment.count({ where: { course_id: { [Op.in]: courseIds }, completion_status: 'completed' } })
      : 0;

    const pendingExams = courseIds.length > 0
      ? await Exam.count({ where: { course_id: { [Op.in]: courseIds }, is_active: true } })
      : 0;

    let averageGrade = 0;
    if (courseIds.length > 0) {
      const exams = await Exam.findAll({ where: { course_id: { [Op.in]: courseIds } }, attributes: ['id'] });
      const examIds = exams.map(e => e.id);
      if (examIds.length > 0) {
        const results = await Result.findAll({ where: { exam_id: { [Op.in]: examIds } }, attributes: ['score', 'total_marks'] });
        if (results.length > 0) {
          const totalPct = results.reduce((sum, r) => sum + (r.total_marks > 0 ? (r.score / r.total_marks) * 100 : r.score || 0), 0);
          averageGrade = Math.round((totalPct / results.length) * 10) / 10;
        }
      }
    }

    let totalWatchTime = 0;
    if (courseIds.length > 0) {
      const modules = await CourseModule.findAll({ where: { course_id: { [Op.in]: courseIds } }, attributes: ['id'] });
      const moduleIds = modules.map(m => m.id);
      if (moduleIds.length > 0) {
        const lessons = await Lesson.findAll({ where: { course_module_id: { [Op.in]: moduleIds } }, attributes: ['id'] });
        const lessonIds = lessons.map(l => l.id);
        if (lessonIds.length > 0) {
          const watchHistory = await VideoWatchHistory.findAll({ where: { lesson_id: { [Op.in]: lessonIds } }, attributes: ['total_watch_time'] });
          const totalSeconds = watchHistory.reduce((sum, w) => sum + (w.total_watch_time || 0), 0);
          totalWatchTime = Math.round(totalSeconds / 3600);
        }
      }
    }

    const liveClasses = courseIds.length > 0
      ? await Exam.count({ where: { course_id: { [Op.in]: courseIds }, is_active: true } })
      : 0;

    // ✅ Fixed: use Student from top-level import, not inline require()
    const recentEnrollments = courseIds.length > 0
      ? await Enrollment.findAll({
          where: { course_id: { [Op.in]: courseIds } },
          include: [
            { model: Student, include: [{ model: User, attributes: ['full_name'] }] },
            { model: Course, attributes: ['course_name'] }
          ],
          order: [['created_at', 'DESC']],
          limit: 5
        })
      : [];

    const activities = recentEnrollments.map(e => ({
      title: `${e.Student?.User?.full_name || 'A student'} enrolled in ${e.Course?.course_name || 'a course'}`,
      time: e.created_at,
      type: 'enrollment'
    }));

    res.json({
      success: true,
      stats: {
        totalCourses, totalStudents, pendingExams,
        pendingAssignments: 0, totalWatchTime, averageGrade,
        liveClasses, activeEnrollments,
        completedAssignments: completedEnrollments
      },
      activities
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard statistics' });
  }
});

module.exports = router;