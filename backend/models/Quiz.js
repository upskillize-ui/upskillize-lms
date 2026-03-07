const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'courses', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  time_limit_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  pass_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'quizzes',
  timestamps: true
});

module.exports = Quiz;