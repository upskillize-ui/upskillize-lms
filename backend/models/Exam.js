const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  exam_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  exam_type: {
    type: DataTypes.ENUM('quiz', 'midterm', 'final', 'mock', 'assignment'),
    defaultValue: 'quiz'
  },
  description: {
    type: DataTypes.TEXT
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  passing_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE
  },
  end_time: {
    type: DataTypes.DATE
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  shuffle_questions: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  show_results_immediately: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'exams',
  timestamps: true
});

module.exports = Exam;
