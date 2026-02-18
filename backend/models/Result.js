const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Result = sequelize.define('Result', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  score: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  grade: {
    type: DataTypes.STRING(5)
  },
  result_status: {
    type: DataTypes.ENUM('draft', 'published', 'pending_review'),
    defaultValue: 'draft'
  },
  answers: {
    type: DataTypes.JSON,
    comment: 'Student answers: {question_id: selected_answer}'
  },
  attempt_number: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  time_taken_minutes: {
    type: DataTypes.INTEGER
  },
  started_at: {
    type: DataTypes.DATE
  },
  submitted_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'results',
  timestamps: true,
  indexes: [
    {
      fields: ['student_id', 'exam_id', 'attempt_number']
    }
  ]
});

module.exports = Result;
