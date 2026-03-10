const express = require('express');
const router = express.Router();
const axios = require('axios');

const AGENT = process.env.MOCK_TEST_AGENT_URL || 'https://upskill25-myagent.hf.space';

router.get('/health', async (req, res) => {
  try {
    const { data } = await axios.get(AGENT + '/api/health', { timeout: 5000 });
    res.json({ success: true, agent: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/generate', async (req, res) => {
  const { lectureId, courseId, topic, numQuestions, durationMinutes, difficulty, questionTypes } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'topic is required' });
  if (!lectureId && !courseId) return res.status(400).json({ success: false, message: 'Provide lectureId or courseId' });
  try {
    const { data } = await axios.post(AGENT + '/api/generate-test', {
      topic,
      lecture_id: lectureId || null,
      course_id: courseId || null,
      num_questions: numQuestions || 10,
      duration_minutes: durationMinutes || 30,
      difficulty: difficulty || 'medium',
      question_types: questionTypes || ['mcq'],
      student_id: req.user ? String(req.user.id) : 'anonymous',
    }, { timeout: 60000 });
    res.json({ success: true, ...data });
  } catch (err) {
    const status = err.response ? err.response.status : 500;
    const message = err.response ? err.response.data.detail : err.message;
    res.status(status).json({ success: false, message });
  }
});

router.post('/submit', async (req, res) => {
  const { testId, questions, answers, timeTakenSeconds } = req.body;
  try {
    const { data } = await axios.post(AGENT + '/api/submit-answers', {
      test_id: testId,
      student_id: req.user ? String(req.user.id) : 'anonymous',
      questions,
      answers,
      time_taken_seconds: timeTakenSeconds,
    }, { timeout: 30000 });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/ingest/lecture', async (req, res) => {
  try {
    const { data } = await axios.post(AGENT + '/api/ingest/lecture', { lecture_id: req.body.lectureId }, { timeout: 10000 });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/ingest/course', async (req, res) => {
  try {
    const { data } = await axios.post(AGENT + '/api/ingest/course', { course_id: req.body.courseId }, { timeout: 10000 });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
