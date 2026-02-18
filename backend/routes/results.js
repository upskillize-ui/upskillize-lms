const express = require('express');
const router = express.Router();
const { Result, Exam, Student, User } = require('../models');
const authMiddleware = require('../middleware/auth');

router.get('/:examId/:studentId', authMiddleware, async (req, res) => {
  try {
    const result = await Result.findOne({
      where: {
        exam_id: req.params.examId,
        student_id: req.params.studentId
      },
      include: [
        { model: Exam },
        { model: Student, include: [User] }
      ]
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching result' });
  }
});

router.get('/student/my-results', authMiddleware, async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { student_id: req.user.roleDataId },
      include: [{ model: Exam }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching results' });
  }
});

module.exports = router;
