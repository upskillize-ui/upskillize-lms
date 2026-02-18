const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  payment_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  signature: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('created', 'completed', 'failed', 'refunded'),
    defaultValue: 'created'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

module.exports = Payment;