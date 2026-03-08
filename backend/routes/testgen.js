const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'TestGen healthy' });
});

router.post('/generate', (req, res) => {
  res.json({ success: true, questions: [] });
});

router.post('/grade', (req, res) => {
  res.json({ success: true, result: {} });
});

module.exports = router;
