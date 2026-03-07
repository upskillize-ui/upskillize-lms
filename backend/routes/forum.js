const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');
const authMiddleware = require('../middleware/auth');

// ── Define models inline (auto-creates tables if not exist) ──
const ForumThread = sequelize.define('ForumThread', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:      { type: DataTypes.STRING(255), allowNull: false },
  content:    { type: DataTypes.TEXT, allowNull: false },
  course:     { type: DataTypes.STRING(255), defaultValue: 'General' },
  author_id:  { type: DataTypes.INTEGER, allowNull: false },
  author_name:{ type: DataTypes.STRING(100) },
  reply_count:{ type: DataTypes.INTEGER, defaultValue: 0 },
  has_answer: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'forum_threads', timestamps: true, underscored: true });

const ForumReply = sequelize.define('ForumReply', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  thread_id:   { type: DataTypes.INTEGER, allowNull: false },
  content:     { type: DataTypes.TEXT, allowNull: false },
  author_id:   { type: DataTypes.INTEGER, allowNull: false },
  author_name: { type: DataTypes.STRING(100) },
  is_answer:   { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'forum_replies', timestamps: true, underscored: true });

// Associations
ForumThread.hasMany(ForumReply, { foreignKey: 'thread_id', as: 'replies' });
ForumReply.belongsTo(ForumThread, { foreignKey: 'thread_id' });

// Auto-create tables
(async () => {
  try {
    await ForumThread.sync({ alter: true });
    await ForumReply.sync({ alter: true });
    console.log('✅ Forum tables ready');
  } catch (e) {
    console.error('Forum table sync error:', e.message);
  }
})();

// ── GET all threads ────────────────────────────────────────────
router.get('/threads', authMiddleware, async (req, res) => {
  try {
    const { course } = req.query;
    const where = course ? { course } : {};

    const threads = await ForumThread.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    const formatted = threads.map(t => ({
      id:          t.id,
      title:       t.title,
      content:     t.content,
      course:      t.course,
      author:      t.author_name,
      author_id:   t.author_id,
      replyCount:  t.reply_count,
      hasAnswer:   t.has_answer,
      createdAt:   t.created_at,
    }));

    res.json({ success: true, threads: formatted });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ success: false, message: 'Error fetching threads' });
  }
});

// ── POST create thread ─────────────────────────────────────────
router.post('/threads', authMiddleware, async (req, res) => {
  try {
    const { title, content, course } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const thread = await ForumThread.create({
      title,
      content,
      course:      course || 'General',
      author_id:   req.user.id,
      author_name: req.user.full_name || req.user.email,
      reply_count: 0,
      has_answer:  false,
    });

    res.status(201).json({
      success: true,
      thread: {
        id:         thread.id,
        title:      thread.title,
        content:    thread.content,
        course:     thread.course,
        author:     thread.author_name,
        author_id:  thread.author_id,
        replyCount: 0,
        hasAnswer:  false,
        createdAt:  thread.created_at,
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ success: false, message: 'Error creating thread' });
  }
});

// ── GET single thread with replies ────────────────────────────
router.get('/threads/:id', authMiddleware, async (req, res) => {
  try {
    const thread = await ForumThread.findByPk(req.params.id, {
      include: [{ model: ForumReply, as: 'replies', order: [['created_at', 'ASC']] }]
    });
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });

    res.json({ success: true, thread });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching thread' });
  }
});

// ── POST reply to thread ───────────────────────────────────────
router.post('/threads/:id/replies', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const thread = await ForumThread.findByPk(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });

    const reply = await ForumReply.create({
      thread_id:   thread.id,
      content,
      author_id:   req.user.id,
      author_name: req.user.full_name || req.user.email,
      is_answer:   false,
    });

    await thread.update({ reply_count: (thread.reply_count || 0) + 1 });

    res.status(201).json({ success: true, reply });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ success: false, message: 'Error creating reply' });
  }
});

// ── PATCH mark reply as answer ─────────────────────────────────
router.patch('/replies/:id/mark-answer', authMiddleware, async (req, res) => {
  try {
    const reply = await ForumReply.findByPk(req.params.id);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    await reply.update({ is_answer: true });
    await ForumThread.update({ has_answer: true }, { where: { id: reply.thread_id } });

    res.json({ success: true, message: 'Marked as answer' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking answer' });
  }
});

// ── DELETE thread (author only) ────────────────────────────────
router.delete('/threads/:id', authMiddleware, async (req, res) => {
  try {
    const thread = await ForumThread.findByPk(req.params.id);
    if (!thread) return res.status(404).json({ success: false, message: 'Thread not found' });
    if (thread.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await ForumReply.destroy({ where: { thread_id: thread.id } });
    await thread.destroy();
    res.json({ success: true, message: 'Thread deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting thread' });
  }
});

module.exports = router;