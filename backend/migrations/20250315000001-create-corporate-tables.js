'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // ── 1. corporate_employees ───────────────────────────────
    await queryInterface.createTable('corporate_employees', {
      id: {
        type:          Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      corporate_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onDelete:   'CASCADE',
      },
      user_id: {
        type:       Sequelize.INTEGER,
        allowNull:  true,
        references: { model: 'users', key: 'id' },
        onDelete:   'SET NULL',
      },
      name: {
        type:      Sequelize.STRING(150),
        allowNull: false,
      },
      email: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      department: {
        type:      Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('active', 'suspended', 'invited'),
        allowNull:    false,
        defaultValue: 'invited',
      },
      last_active: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      invited_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('corporate_employees', ['corporate_id']);
    await queryInterface.addIndex('corporate_employees', ['email']);
    await queryInterface.addIndex('corporate_employees', ['corporate_id', 'email'], { unique: true });

    // ── 2. employee_course_assignments ───────────────────────
    await queryInterface.createTable('employee_course_assignments', {
      id: {
        type:          Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      employee_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'corporate_employees', key: 'id' },
        onDelete:   'CASCADE',
      },
      course_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'courses', key: 'id' },
        onDelete:   'CASCADE',
      },
      assigned_by: {
        type:      Sequelize.INTEGER,
        allowNull: true,
      },
      deadline: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      progress_pct: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
      status: {
        type:         Sequelize.ENUM('assigned', 'in_progress', 'completed', 'overdue'),
        allowNull:    false,
        defaultValue: 'assigned',
      },
      certificate_url: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      completed_at: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('employee_course_assignments', ['employee_id']);
    await queryInterface.addIndex('employee_course_assignments', ['course_id']);
    await queryInterface.addIndex('employee_course_assignments', ['status']);
    await queryInterface.addIndex('employee_course_assignments', ['employee_id', 'course_id'], { unique: true });

    // ── 3. corporate_job_postings ────────────────────────────
    await queryInterface.createTable('corporate_job_postings', {
      id: {
        type:          Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      corporate_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onDelete:   'CASCADE',
      },
      title: {
        type:      Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      skills_required: {
        type:         Sequelize.JSON,
        allowNull:    false,
        defaultValue: [],
      },
      min_cgpa: {
        type:         Sequelize.DECIMAL(3, 1),
        allowNull:    false,
        defaultValue: 0,
      },
      location: {
        type:         Sequelize.STRING(150),
        allowNull:    true,
        defaultValue: 'Remote',
      },
      package_lpa: {
        type:         Sequelize.DECIMAL(5, 2),
        allowNull:    true,
        defaultValue: 0,
      },
      deadline: {
        type:      Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type:         Sequelize.ENUM('open', 'closed'),
        allowNull:    false,
        defaultValue: 'open',
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('corporate_job_postings', ['corporate_id']);
    await queryInterface.addIndex('corporate_job_postings', ['status']);

    // ── 4. corporate_job_applications ────────────────────────
    await queryInterface.createTable('corporate_job_applications', {
      id: {
        type:          Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      job_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'corporate_job_postings', key: 'id' },
        onDelete:   'CASCADE',
      },
      student_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onDelete:   'CASCADE',
      },
      status: {
        type:         Sequelize.ENUM('applied', 'shortlisted', 'rejected', 'hired'),
        allowNull:    false,
        defaultValue: 'applied',
      },
      applied_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('corporate_job_applications', ['job_id']);
    await queryInterface.addIndex('corporate_job_applications', ['student_id']);
    await queryInterface.addIndex('corporate_job_applications', ['job_id', 'student_id'], { unique: true });

    // ── 5. corporate_shortlist ───────────────────────────────
    await queryInterface.createTable('corporate_shortlist', {
      id: {
        type:          Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:    true,
      },
      corporate_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onDelete:   'CASCADE',
      },
      student_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'users', key: 'id' },
        onDelete:   'CASCADE',
      },
      job_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'corporate_job_postings', key: 'id' },
        onDelete:   'CASCADE',
      },
      note: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('corporate_shortlist', ['corporate_id']);
    await queryInterface.addIndex('corporate_shortlist', ['student_id']);
    await queryInterface.addIndex('corporate_shortlist', ['corporate_id', 'student_id', 'job_id'], { unique: true });
  },

  async down(queryInterface) {
    // Drop in reverse order to respect FK constraints
    await queryInterface.dropTable('corporate_shortlist');
    await queryInterface.dropTable('corporate_job_applications');
    await queryInterface.dropTable('corporate_job_postings');
    await queryInterface.dropTable('employee_course_assignments');
    await queryInterface.dropTable('corporate_employees');

    // Also drop the ENUMs (PostgreSQL only — safe to ignore on MySQL)
    const enums = [
      'enum_corporate_employees_status',
      'enum_employee_course_assignments_status',
      'enum_corporate_job_postings_status',
      'enum_corporate_job_applications_status',
    ];
    for (const e of enums) {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${e}";`).catch(() => {});
    }
  },
};