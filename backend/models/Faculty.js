const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Faculty = sequelize.define('Faculty', {
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
  employee_id: {
    type: DataTypes.STRING(50),
    unique: true
  },
  department: {
    type: DataTypes.STRING(100)
  },
  qualifications: {
    type: DataTypes.TEXT
  },
  subjects: {
    type: DataTypes.TEXT
  },
  bio: {
    type: DataTypes.TEXT
  },
  experience_years: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'faculty',
  timestamps: true
});

module.exports = Faculty;
