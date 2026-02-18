const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
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
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  completion_status: {
    type: DataTypes.ENUM('enrolled', 'in_progress', 'completed', 'withdrawn'),
    defaultValue: 'enrolled'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'partial', 'refunded'),
    defaultValue: 'pending'
  },
  progress_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'enrollments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_id']
    }
  ]
});

module.exports = Enrollment;
