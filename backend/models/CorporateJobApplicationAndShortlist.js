'use strict';
const { Model, DataTypes } = require('sequelize');

// ─────────────────────────────────────────────────────────────
// CorporateJobApplication
// Tracks students who apply to a corporate job posting
// ─────────────────────────────────────────────────────────────
module.exports.CorporateJobApplication = (sequelize) => {
  class CorporateJobApplication extends Model {
    static associate(models) {
      CorporateJobApplication.belongsTo(models.CorporateJobPosting, {
        foreignKey: 'job_id',
        as:         'job',
      });
      CorporateJobApplication.belongsTo(models.User, {
        foreignKey: 'student_id',
        as:         'student',
      });
    }
  }

  CorporateJobApplication.init(
    {
      id: {
        type:          DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      job_id: {
        type:       DataTypes.INTEGER,
        allowNull:  false,
        references: { model: 'corporate_job_postings', key: 'id' },
        onDelete:   'CASCADE',
      },
      student_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'User.id of the student who applied',
      },
      status: {
        type:         DataTypes.ENUM('applied', 'shortlisted', 'rejected', 'hired'),
        allowNull:    false,
        defaultValue: 'applied',
      },
      cover_note: {
        type:      DataTypes.TEXT,
        allowNull: true,
      },
      applied_at: {
        type:         DataTypes.DATE,
        allowNull:    false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName:  'CorporateJobApplication',
      tableName:  'corporate_job_applications',
      timestamps: true,
      indexes: [
        { fields: ['job_id'] },
        { fields: ['student_id'] },
        { fields: ['status'] },
        { unique: true, fields: ['job_id', 'student_id'] },
      ],
    }
  );

  return CorporateJobApplication;
};

// ─────────────────────────────────────────────────────────────
// CorporateShortlist
// Corporate manually shortlists a student for a job (talent pipeline)
// ─────────────────────────────────────────────────────────────
module.exports.CorporateShortlist = (sequelize) => {
  class CorporateShortlist extends Model {
    static associate(models) {
      // The corporate account that created this shortlist entry
      CorporateShortlist.belongsTo(models.User, {
        foreignKey: 'corporate_id',
        as:         'corporate',
      });
      // The student's User record (name, email)
      CorporateShortlist.belongsTo(models.User, {
        foreignKey: 'student_id',
        as:         'student',
      });
      // The student's Student profile (resume_url etc.)
      // student_id in CorporateShortlist maps to user_id in Student
      CorporateShortlist.belongsTo(models.Student, {
        foreignKey: 'student_id',
        targetKey:  'user_id',
        as:         'profile',
      });
      // The job this shortlist entry is for
      CorporateShortlist.belongsTo(models.CorporateJobPosting, {
        foreignKey: 'job_id',
        as:         'job',
      });
    }
  }

  CorporateShortlist.init(
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
      student_id: {
        type:      DataTypes.INTEGER,
        allowNull: false,
        comment:   'User.id of the shortlisted student',
      },
      job_id: {
        type:       DataTypes.INTEGER,
        allowNull:  false,
        references: { model: 'corporate_job_postings', key: 'id' },
        onDelete:   'CASCADE',
        comment:    'CorporateJobPosting.id',
      },
      note: {
        type:      DataTypes.TEXT,
        allowNull: true,
        comment:   'Optional note from corporate about this candidate',
      },
    },
    {
      sequelize,
      modelName:  'CorporateShortlist',
      tableName:  'corporate_shortlist',   // keeps your original table name
      timestamps: true,
      indexes: [
        { fields: ['corporate_id'] },
        { fields: ['student_id'] },
        { fields: ['job_id'] },
        { unique: true, fields: ['corporate_id', 'student_id', 'job_id'] },
      ],
    }
  );

  return CorporateShortlist;
};