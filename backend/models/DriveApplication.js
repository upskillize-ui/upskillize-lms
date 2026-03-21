const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DriveApplication = sequelize.define('DriveApplication', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  drive_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  student_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type:         DataTypes.ENUM('applied', 'shortlisted', 'r1', 'r2', 'hr', 'selected', 'rejected'),
    defaultValue: 'applied',
  },
  round_number: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
  },
  rejection_reason: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  selected_at: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  offer_letter_url: {
    type:      DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName:  'drive_applications',
  timestamps: true,
  indexes: [{ unique: true, fields: ['drive_id', 'student_id'] }],
});

module.exports = DriveApplication;