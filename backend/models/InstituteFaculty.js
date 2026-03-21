const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InstituteFaculty = sequelize.define('InstituteFaculty', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  institute_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  faculty_id: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  batch_id: {
    type:      DataTypes.INTEGER,
    allowNull: true,
  },
  course_count: {
    type:         DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName:   'institute_faculty',
  timestamps:  true,
  underscored: true,
});

module.exports = InstituteFaculty;