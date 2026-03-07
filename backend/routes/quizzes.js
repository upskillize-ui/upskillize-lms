const express = require('express');
const router = express.Router();
const { Quiz, QuizQuestion, QuizAttempt, Course, Student, User, Faculty } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// ── FACULTY: Get all quizzes for faculty's courses ─────────────
router.get('/', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    const facultyId = faculty ? faculty.id : req.user.roleDataId;

    const courses = await Course.findAll({ where: { faculty_id: facultyId } });
    const courseIds = courses.map(c => c.id);

    const quizzes = await Quiz.findAll({
      where: { course_id: courseIds },
      include: [
        { model: Course, attributes: ['course_name'] },
        { model: QuizQuestion, attributes: ['id'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const quizzesWithCount = quizzes.map(q => ({
      ...q.toJSON(),
      question_count: q.QuizQuestions?.length || 0
    }));

    res.json({ success: true, quizzes: quizzesWithCount });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching quizzes' });
  }
});

// ── Get quizzes for a course (students) ───────────────────────
router.get('/course/:course_id', authMiddleware, async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: { course_id: req.params.course_id, is_active: true },
      include: [{ model: QuizQuestion, attributes: ['id'] }]
    });

    const quizzesWithCount = quizzes.map(q => ({
      ...q.toJSON(),
      question_count: q.QuizQuestions?.length || 0
    }));

    res.json({ success: true, quizzes: quizzesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching quizzes' });
  }
});

// ── FACULTY: Create a quiz ─────────────────────────────────────
router.post('/', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const { course_id, title, description, time_limit_minutes, pass_percentage } = req.body;

    const faculty = await Faculty.findOne({ where: { user_id: req.user.id } });
    const facultyId = faculty ? faculty.id : req.user.roleDataId;

    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Verify faculty owns this course
    if (req.user.role === 'faculty' && course.faculty_id !== facultyId) {
      return res.status(403).json({ success: false, message: 'Not authorized for this course' });
    }

    const quiz = await Quiz.create({
      course_id,
      title,
      description,
      time_limit_minutes: time_limit_minutes || 30,
      pass_percentage: pass_percentage || 60
    });

    res.status(201).json({ success: true, message: 'Quiz created', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Error creating quiz', error: error.message });
  }
});

// ── FACULTY: Add questions to a quiz ──────────────────────────
router.post('/:quiz_id/questions', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const { questions } = req.body;

    const quiz = await Quiz.findByPk(req.params.quiz_id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const created = await QuizQuestion.bulkCreate(
      questions.map((q, i) => ({ ...q, quiz_id: quiz.id, sequence_order: i + 1 }))
    );

    res.status(201).json({ success: true, message: 'Questions added', questions: created });
  } catch (error) {
    console.error('Add questions error:', error);
    res.status(500).json({ success: false, message: 'Error adding questions', error: error.message });
  }
});

// ── Get single quiz with questions ────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{
        model: QuizQuestion,
        attributes: req.user.role === 'student'
          ? ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'marks', 'sequence_order']
          : undefined,
        order: [['sequence_order', 'ASC']]
      }]
    });

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching quiz' });
  }
});

// ── STUDENT: Submit quiz ───────────────────────────────────────
router.post('/:id/submit', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const { answers, time_taken_seconds } = req.body;

    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: QuizQuestion }]
    });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Calculate score
    let score = 0;
    let total_marks = 0;
    const result_details = quiz.QuizQuestions.map(q => {
      total_marks += q.marks;
      const student_answer = answers[q.id];
      const is_correct = student_answer === q.correct_option;
      if (is_correct) score += q.marks;
      return {
        question_id: q.id,
        question_text: q.question_text,
        student_answer,
        correct_option: q.correct_option,
        is_correct,
        marks: q.marks
      };
    });

    const percentage = total_marks > 0 ? Math.round((score / total_marks) * 100) : 0;
    const passed = percentage >= quiz.pass_percentage;

    const attempt = await QuizAttempt.create({
      quiz_id: quiz.id,
      student_id: student.id,
      answers,
      score,
      total_marks,
      time_taken_seconds,
      passed,
      submitted_at: new Date()
    });

    res.json({
      success: true,
      message: passed ? '🎉 You passed!' : 'Quiz submitted. Better luck next time!',
      result: {
        score, total_marks, percentage, passed,
        pass_percentage: quiz.pass_percentage,
        time_taken_seconds, result_details,
        attempt_id: attempt.id
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ success: false, message: 'Error submitting quiz', error: error.message });
  }
});

// ── FACULTY: View results ──────────────────────────────────────
router.get('/:id/results', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { quiz_id: req.params.id },
      include: [{
        model: Student,
        include: [{ model: User, attributes: ['full_name', 'email'] }]
      }],
      order: [['submitted_at', 'DESC']]
    });

    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching results' });
  }
});

// ── FACULTY: Delete quiz ───────────────────────────────────────
router.delete('/:id', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    await quiz.destroy();
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting quiz' });
  }
});

module.exports = router;