'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CorporateJobPosting extends Model {
    static associate(models) {
      CorporateJobPosting.belongsTo(models.User, {
        foreignKey: 'corporate_id',
        as: 'corporate',
      });
      CorporateJobPosting.hasMany(models.CorporateJobApplication, {
        foreignKey: 'job_id',
        as: 'applications',
      });
      CorporateJobPosting.hasMany(models.CorporateShortlist, {
        foreignKey: 'job_id',
        as: 'shortlist',
      });
    }
  }

  CorporateJobPosting.init(
    {
      id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      corporate_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'User.id of the corporate account',
      },
      title: {
        type:      DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type:      DataTypes.TEXT,
        allowNull: false,
      },
      skills_required: {
        type:         DataTypes.JSON,
        allowNull:    false,
        defaultValue: [],
        comment:      'Array of skill strings e.g. ["React","Node.js"]',
      },
      min_cgpa: {
        type:         DataTypes.DECIMAL(3, 1),
        allowNull:    false,
        defaultValue: 0,
      },
      location: {
        type:         DataTypes.STRING(150),
        allowNull:    true,
        defaultValue: 'Remote',
      },
      package_lpa: {
        type:         DataTypes.DECIMAL(5, 2),
        allowNull:    true,
        defaultValue: 0,
      },
      deadline: {
        type:      DataTypes.DATEONLY,
        allowNull: true,
      },
      status: {
        type:         DataTypes.ENUM('open', 'closed'),
        allowNull:    false,
        defaultValue: 'open',
      },
    },
    {
      sequelize,
      modelName:  'CorporateJobPosting',
      tableName:  'corporate_job_postings',
      timestamps: true,
      indexes: [
        { fields: ['corporate_id'] },
        { fields: ['status'] },
      ],
    }
  );

  return CorporateJobPosting;
};