const express = require('express');
const router = express.Router();
const { CourseModule, Course, Lesson } = require('../models');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Get modules for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const modules = await CourseModule.findAll({
      where: { course_id: req.params.courseId },
      include: [{ model: Lesson, order: [['sequence_order', 'ASC']] }],
      order: [['sequence_order', 'ASC']]
    });

    res.json({ success: true, modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ success: false, message: 'Error fetching modules' });
  }
});

// Create module
router.post('/', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const { course_id, module_name, description, sequence_order } = req.body;

    const module = await CourseModule.create({
      course_id,
      module_name,
      description,
      sequence_order
    });

    res.status(201).json({ success: true, message: 'Module created successfully', module });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ success: false, message: 'Error creating module' });
  }
});

// Update module
router.put('/:id', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const module = await CourseModule.findByPk(req.params.id);
    
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    await module.update(req.body);
    res.json({ success: true, message: 'Module updated successfully', module });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ success: false, message: 'Error updating module' });
  }
});

// Delete module
router.delete('/:id', authMiddleware, rbac(['faculty', 'admin']), async (req, res) => {
  try {
    const module = await CourseModule.findByPk(req.params.id);
    
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    await module.destroy();
    res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ success: false, message: 'Error deleting module' });
  }
});

module.exports = router;
