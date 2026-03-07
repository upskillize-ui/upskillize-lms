const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('assignment', 'exam', 'announcement', 'result', 'enrollment', 'payment', 'general'),
    defaultValue: 'general'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  link: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true  // ✅ this one line fixes everything — maps createdAt → created_at
});

module.exports = Notification;