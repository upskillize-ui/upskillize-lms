const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PlacementDrive = sequelize.define('PlacementDrive', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  created_by: {
    type:      DataTypes.INTEGER,
    allowNull: true,
  },
  company_name: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  jd_text: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  package_lpa: {
    type:         DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  min_cgpa: {
    type:         DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  location: {
    type:         DataTypes.STRING(255),
    defaultValue: '',
  },
  role_type: {
    type:         DataTypes.ENUM('full-time', 'internship', 'contract'),
    defaultValue: 'full-time',
  },
  required_skills: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },
  eligible_batches: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },
  deadline: {
    type:      DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type:         DataTypes.ENUM('draft', 'open', 'closed', 'archived'),
    defaultValue: 'open',
  },
}, {
  tableName:  'placement_drives',
  timestamps: true,
});

module.exports = PlacementDrive;