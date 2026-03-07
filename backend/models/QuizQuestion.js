const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
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
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  option_a: { type: DataTypes.STRING(500), allowNull: false },
  option_b: { type: DataTypes.STRING(500), allowNull: false },
  option_c: { type: DataTypes.STRING(500) },
  option_d: { type: DataTypes.STRING(500) },
  correct_option: {
    type: DataTypes.ENUM('a', 'b', 'c', 'd'),
    allowNull: false
  },
  marks: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  sequence_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'quiz_questions',
  timestamps: true
});

module.exports = QuizQuestion;