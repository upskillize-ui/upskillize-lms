'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CorporateEmployee extends Model {
    static associate(models) {
      // belongs to the corporate user who invited them
      CorporateEmployee.belongsTo(models.User, {
        foreignKey: 'corporate_id',
        as: 'corporate',
      });
      // the employee's own user account
      CorporateEmployee.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      // course assignments for this employee
      CorporateEmployee.hasMany(models.EmployeeCourseAssignment, {
        foreignKey: 'employee_id',
        as: 'assignments',
      });
    }
  }

  CorporateEmployee.init(
    {
      id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      corporate_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'User.id of the corporate account that owns this employee',
      },
      user_id: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'User.id once the employee accepts invite and registers',
      },
      name: {
        type:      DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type:      DataTypes.STRING(255),
        allowNull: false,
        validate:  { isEmail: true },
      },
      department: {
        type:      DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type:         DataTypes.ENUM('active', 'suspended', 'invited'),
        allowNull:    false,
        defaultValue: 'invited',
      },
      last_active: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
      invited_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName:  'CorporateEmployee',
      tableName:  'corporate_employees',
      timestamps: true,
      indexes: [
        { fields: ['corporate_id'] },
        { fields: ['email'] },
        { unique: true, fields: ['corporate_id', 'email'] },
      ],
    }
  );

  return CorporateEmployee;
};