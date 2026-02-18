const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  course_code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING(100)
  },
  duration_hours: {
    type: DataTypes.INTEGER
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  thumbnail: {
    type: DataTypes.STRING(255)
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'faculty',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  difficulty_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'English'
  },
  prerequisites: {
    type: DataTypes.TEXT
  },
  learning_outcomes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'courses',
  timestamps: true
});

module.exports = Course;
