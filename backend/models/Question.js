const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.ENUM('mcq', 'true_false', 'short_answer', 'essay'),
    defaultValue: 'mcq'
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  options: {
    type: DataTypes.JSON,
    comment: 'Array of options for MCQ: [{label: "A", text: "Option 1"}, ...]'
  },
  correct_answer: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'questions',
  timestamps: true
});

module.exports = Question;
