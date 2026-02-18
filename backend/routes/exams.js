const express = require('express');
const router = express.Router();
const { Exam, Question, Result, Course } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.post('/', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating exam' });
  }
});

router.post('/:id/start', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [{ model: Question }]
    });

    if (!exam || !exam.is_active) {
      return res.status(400).json({ success: false, message: 'Exam not available' });
    }

    const questions = exam.Questions.map(({ id, question_text, question_type, marks, options }) => ({
      id, question_text, question_type, marks, options
    }));

    if (exam.shuffle_questions) {
      questions.sort(() => 0.5 - Math.random());
    }

    res.json({
      success: true,
      exam: {
        id: exam.id,
        exam_name: exam.exam_name,
        duration_minutes: exam.duration_minutes,
        total_marks: exam.total_marks
      },
      questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting exam' });
  }
});

router.post('/:id/submit', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const { answers, time_taken_minutes } = req.body;
    
    const questions = await Question.findAll({ where: { exam_id: req.params.id } });
    
    let score = 0;
    let totalMarks = 0;
    
    questions.forEach(q => {
      totalMarks += q.marks;
      if (q.question_type !== 'essay' && answers[q.id] === q.correct_answer) {
        score += q.marks;
      }
    });

    const percentage = (score / totalMarks) * 100;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : 
                  percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F';

    const hasEssay = questions.some(q => q.question_type === 'essay');

    const result = await Result.create({
      student_id: req.user.roleDataId,
      exam_id: req.params.id,
      score,
      total_marks: totalMarks,
      percentage,
      grade,
      result_status: hasEssay ? 'pending_review' : 'published',
      answers,
      time_taken_minutes,
      started_at: new Date(Date.now() - time_taken_minutes * 60000),
      submitted_at: new Date()
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ success: false, message: 'Error submitting exam' });
  }
});

module.exports = router;
