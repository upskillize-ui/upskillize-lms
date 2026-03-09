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

  // Total course price — full amount due
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },

  // Amount actually received so far (used for partial payments)
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'How much the student has paid so far'
  },

  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },

  // 'partial' = student paid some but not the full amount
  status: {
    type: DataTypes.ENUM('created', 'completed', 'failed', 'refunded', 'partial'),
    defaultValue: 'created'
  },

  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  // Optional admin note e.g. "Paid ₹500 of ₹1000 on 01-Mar"
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true
});

module.exports = Payment;