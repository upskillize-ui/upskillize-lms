const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'quizzes', key: 'id' }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  answers: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_marks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  time_taken_seconds: {
    type: DataTypes.INTEGER
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  submitted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: true
});

module.exports = QuizAttempt;