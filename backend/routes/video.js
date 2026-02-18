const express = require('express');
const router = express.Router();
const { VideoWatchHistory, Lesson, Student } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.post('/track', authMiddleware, rbac(['student']), async (req, res) => {
  try {
    const { lesson_id, current_time, duration } = req.body;
    
    const percentage = (current_time / duration) * 100;
    
    let history = await VideoWatchHistory.findOne({
      where: { student_id: req.user.roleDataId, lesson_id }
    });

    if (history) {
      history.last_position = current_time;
      history.completion_percentage = percentage;
      history.total_watch_time += 1;
      history.last_watched_at = new Date();
      await history.save();
    } else {
      history = await VideoWatchHistory.create({
        student_id: req.user.roleDataId,
        lesson_id,
        last_position: current_time,
        completion_percentage: percentage,
        total_watch_time: 1,
        watch_count: 1
      });
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking video' });
  }
});

router.get('/history/:lessonId', authMiddleware, async (req, res) => {
  try {
    const history = await VideoWatchHistory.findOne({
      where: {
        student_id: req.user.roleDataId,
        lesson_id: req.params.lessonId
      }
    });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history' });
  }
});

module.exports = router;
