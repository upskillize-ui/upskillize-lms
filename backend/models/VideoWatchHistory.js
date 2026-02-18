const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VideoWatchHistory = sequelize.define('VideoWatchHistory', {
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
  lesson_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  total_watch_time: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total watch time in seconds'
  },
  last_position: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Last watched position in seconds'
  },
  completion_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  watch_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_watched_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'video_watch_history',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'lesson_id']
    }
  ]
});

module.exports = VideoWatchHistory;
