const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Batch = sequelize.define('Batch', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  institute_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type:         DataTypes.STRING(50),
    defaultValue: 'active',
  },
  course_ids: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },
  faculty_assignments: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },
  timetable_json: {
    type:         DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName:   'batches',
  timestamps:  true,
  underscored: true,
});

module.exports = Batch;