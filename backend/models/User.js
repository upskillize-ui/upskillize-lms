const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  full_name: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },
  password_hash: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    // ✅ Updated: added placement, corporate, institute
    type:         DataTypes.ENUM('student', 'faculty', 'admin', 'placement', 'corporate', 'institute'),
    defaultValue: 'student',
    allowNull:    false,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  profile_photo: {
    type: DataTypes.STRING(255),
  },
  is_active: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  reset_token: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
  reset_token_expiry: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName:  'users',
  timestamps: true,
  underscored: true,
});

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = User;