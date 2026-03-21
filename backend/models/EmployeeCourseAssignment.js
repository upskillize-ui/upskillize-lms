'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EmployeeCourseAssignment extends Model {
    static associate(models) {
      EmployeeCourseAssignment.belongsTo(models.CorporateEmployee, {
        foreignKey: 'employee_id',
        as: 'employee',
      });
      EmployeeCourseAssignment.belongsTo(models.Course, {
        foreignKey: 'course_id',
        as: 'course',
      });
    }
  }

  EmployeeCourseAssignment.init(
    {
      id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      employee_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'CorporateEmployee.id',
      },
      course_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'Course.id',
      },
      assigned_by: {
        type:      DataTypes.INTEGER,
        allowNull: true,
        comment:   'User.id of the corporate admin who assigned this',
      },
      deadline: {
        type:      DataTypes.DATEONLY,
        allowNull: true,
      },
      progress_pct: {
        type:         DataTypes.INTEGER,
        allowNull:    false,
        defaultValue: 0,
        validate:     { min: 0, max: 100 },
      },
      status: {
        type:         DataTypes.ENUM('assigned', 'in_progress', 'completed', 'overdue'),
        allowNull:    false,
        defaultValue: 'assigned',
      },
      certificate_url: {
        type:      DataTypes.STRING(500),
        allowNull: true,
      },
      completed_at: {
        type:      DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName:  'EmployeeCourseAssignment',
      tableName:  'employee_course_assignments',
      timestamps: true,
      indexes: [
        { fields: ['employee_id'] },
        { fields: ['course_id'] },
        { unique: true, fields: ['employee_id', 'course_id'] },
      ],
    }
  );

  return EmployeeCourseAssignment;
};