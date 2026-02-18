const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_module_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'course_modules',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  lesson_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  sequence_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  content_type: {
    type: DataTypes.ENUM('video', 'pdf', 'ppt', 'text', 'quiz'),
    defaultValue: 'video'
  },
  content_url: {
    type: DataTypes.STRING(500)
  },
  youtube_video_id: {
    type: DataTypes.STRING(50)
  },
  duration_minutes: {
    type: DataTypes.INTEGER
  },
  is_preview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'lessons',
  timestamps: true
});

module.exports = Lesson;
