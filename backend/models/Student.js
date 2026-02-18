const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
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
  enrollment_number: {
    type: DataTypes.STRING(50),
    unique: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(100)
  },
  country: {
    type: DataTypes.STRING(100)
  },
  postal_code: {
    type: DataTypes.STRING(20)
  }
}, {
  tableName: 'students',
  timestamps: true
});

module.exports = Student;
