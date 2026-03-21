'use strict';

const { sequelize } = require('../config/database');

// ─────────────────────────────────────────────────────────────
// 1. DIRECT-STYLE MODELS  (existing — already return the class)
// ─────────────────────────────────────────────────────────────
const User              = require('./User');
const Student           = require('./Student');
const Faculty           = require('./Faculty');
const Course            = require('./Course');
const CourseModule      = require('./CourseModule');
const Lesson            = require('./Lesson');
const Enrollment        = require('./Enrollment');
const VideoWatchHistory = require('./VideoWatchHistory');
const Exam              = require('./Exam');
const Question          = require('./Question');
const Result            = require('./Result');
const Notification      = require('./Notification');
const Payment           = require('./Payment');
const Quiz              = require('./Quiz');
const QuizQuestion      = require('./QuizQuestion');
const QuizAttempt       = require('./QuizAttempt');
const Batch             = require('./Batch');
const InstituteFaculty  = require('./InstituteFaculty');
const PlacementDrive    = require('./PlacementDrive');
const DriveApplication  = require('./DriveApplication');

// ─────────────────────────────────────────────────────────────
// 2. FACTORY-STYLE MODELS  (module.exports = (sequelize) => Model)
//    CorporateEmployee, EmployeeCourseAssignment, CorporateJobPosting
// ─────────────────────────────────────────────────────────────
const CorporateEmployee        = require('./CorporateEmployee')(sequelize);
const EmployeeCourseAssignment = require('./EmployeeCourseAssignment')(sequelize);
const CorporateJobPosting      = require('./CorporateJobPosting')(sequelize);

// ─────────────────────────────────────────────────────────────
// 3. NAMED-EXPORT FACTORY STYLE
//    module.exports.CorporateJobApplication = (sequelize) => Model
//    module.exports.CorporateShortlist       = (sequelize) => Model
//    Both live in the same file: CorporateJobModels.js
// ─────────────────────────────────────────────────────────────
const corporateJobModels       = require('./CorporateJobApplicationAndShortlist');
const CorporateJobApplication  = corporateJobModels.CorporateJobApplication(sequelize);
const CorporateShortlist       = corporateJobModels.CorporateShortlist(sequelize);

// ─────────────────────────────────────────────────────────────
// MODELS MAP — passed into every associate() call
// ─────────────────────────────────────────────────────────────
const models = {
  User,
  Student,
  Faculty,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  VideoWatchHistory,
  Exam,
  Question,
  Result,
  Notification,
  Payment,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Batch,
  InstituteFaculty,
  PlacementDrive,
  DriveApplication,
  CorporateEmployee,
  EmployeeCourseAssignment,
  CorporateJobPosting,
  CorporateJobApplication,
  CorporateShortlist,
};

// Run associate() on all factory/named-export models that define it
[
  CorporateEmployee,
  EmployeeCourseAssignment,
  CorporateJobPosting,
  CorporateJobApplication,
  CorporateShortlist,
].forEach(model => {
  if (typeof model.associate === 'function') model.associate(models);
});

// ─────────────────────────────────────────────────────────────
// ASSOCIATIONS — direct-style models
// ─────────────────────────────────────────────────────────────

// User ↔ Student
User.hasOne(Student,  { foreignKey: 'user_id', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User ↔ Faculty
User.hasOne(Faculty,  { foreignKey: 'user_id', onDelete: 'CASCADE' });
Faculty.belongsTo(User, { foreignKey: 'user_id' });

// User ↔ Notification
User.hasMany(Notification,  { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// User ↔ Payment
User.hasMany(Payment,  { foreignKey: 'user_id', onDelete: 'CASCADE' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

// Course ↔ Payment
Course.hasMany(Payment,  { foreignKey: 'course_id' });
Payment.belongsTo(Course, { foreignKey: 'course_id' });

// Faculty ↔ Course
Faculty.hasMany(Course,  { foreignKey: 'faculty_id' });
Course.belongsTo(Faculty, { foreignKey: 'faculty_id' });

// Course ↔ CourseModule
Course.hasMany(CourseModule,  { foreignKey: 'course_id', onDelete: 'CASCADE' });
CourseModule.belongsTo(Course, { foreignKey: 'course_id' });

// CourseModule ↔ Lesson
CourseModule.hasMany(Lesson,  { foreignKey: 'course_module_id', onDelete: 'CASCADE' });
Lesson.belongsTo(CourseModule, { foreignKey: 'course_module_id' });

// Student ↔ Enrollment
Student.hasMany(Enrollment,  { foreignKey: 'student_id', onDelete: 'CASCADE' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id' });

// Course ↔ Enrollment
Course.hasMany(Enrollment,  { foreignKey: 'course_id', onDelete: 'CASCADE' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

// Student ↔ VideoWatchHistory
Student.hasMany(VideoWatchHistory,  { foreignKey: 'student_id', onDelete: 'CASCADE' });
VideoWatchHistory.belongsTo(Student, { foreignKey: 'student_id' });

// Lesson ↔ VideoWatchHistory
Lesson.hasMany(VideoWatchHistory,  { foreignKey: 'lesson_id', onDelete: 'CASCADE' });
VideoWatchHistory.belongsTo(Lesson, { foreignKey: 'lesson_id' });

// Course ↔ Exam
Course.hasMany(Exam,  { foreignKey: 'course_id', onDelete: 'CASCADE' });
Exam.belongsTo(Course, { foreignKey: 'course_id' });

// Exam ↔ Question
Exam.hasMany(Question,  { foreignKey: 'exam_id', onDelete: 'CASCADE' });
Question.belongsTo(Exam, { foreignKey: 'exam_id' });

// Student ↔ Result
Student.hasMany(Result,  { foreignKey: 'student_id', onDelete: 'CASCADE' });
Result.belongsTo(Student, { foreignKey: 'student_id' });

// Exam ↔ Result
Exam.hasMany(Result,  { foreignKey: 'exam_id', onDelete: 'CASCADE' });
Result.belongsTo(Exam, { foreignKey: 'exam_id' });

// Course ↔ Quiz
Course.hasMany(Quiz,  { foreignKey: 'course_id', onDelete: 'CASCADE' });
Quiz.belongsTo(Course, { foreignKey: 'course_id' });

// Quiz ↔ QuizQuestion
Quiz.hasMany(QuizQuestion,  { foreignKey: 'quiz_id', onDelete: 'CASCADE' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// Quiz ↔ QuizAttempt
Quiz.hasMany(QuizAttempt,  { foreignKey: 'quiz_id', onDelete: 'CASCADE' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });

// Student ↔ QuizAttempt
Student.hasMany(QuizAttempt,  { foreignKey: 'student_id', onDelete: 'CASCADE' });
QuizAttempt.belongsTo(Student, { foreignKey: 'student_id' });

// Batch ↔ Student
Batch.hasMany(Student,   { foreignKey: 'batch_id' });
Student.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });

// InstituteFaculty ↔ User
InstituteFaculty.belongsTo(User, { foreignKey: 'faculty_id', as: 'faculty' });
User.hasMany(InstituteFaculty,   { foreignKey: 'faculty_id' });

// PlacementDrive ↔ DriveApplication
PlacementDrive.hasMany(DriveApplication,    { foreignKey: 'drive_id', as: 'applications' });
DriveApplication.belongsTo(PlacementDrive,  { foreignKey: 'drive_id', as: 'drive' });

// DriveApplication ↔ User
User.hasMany(DriveApplication,         { foreignKey: 'student_id' });
DriveApplication.belongsTo(User,       { foreignKey: 'student_id', as: 'student' });

// ─────────────────────────────────────────────────────────────
// ASSOCIATIONS — corporate models (reverse / hasMany side)
// The belongsTo sides are already declared in each model's associate()
// ─────────────────────────────────────────────────────────────

// User → CorporateEmployee (one corporate user has many employees)
User.hasMany(CorporateEmployee,  { foreignKey: 'corporate_id', as: 'corporateEmployees' });

// User → CorporateJobPosting
User.hasMany(CorporateJobPosting, { foreignKey: 'corporate_id', as: 'jobPostings' });

// User → CorporateShortlist
User.hasMany(CorporateShortlist,  { foreignKey: 'corporate_id', as: 'shortlists' });

// Course → EmployeeCourseAssignment
// (CorporateEmployee → EmployeeCourseAssignment handled by CorporateEmployee.associate())
Course.hasMany(EmployeeCourseAssignment, {
  foreignKey: 'course_id',
  as:         'corpAssignments',
});
// NOTE: CorporateJobPosting → CorporateJobApplication and CorporateShortlist
// are handled inside CorporateJobPosting.associate() — not repeated here.

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────
module.exports = {
  sequelize,
  User,
  Student,
  Faculty,
  Course,
  CourseModule,
  Lesson,
  Enrollment,
  VideoWatchHistory,
  Exam,
  Question,
  Result,
  Notification,
  Payment,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  Batch,
  InstituteFaculty,
  PlacementDrive,
  DriveApplication,
  CorporateEmployee,
  EmployeeCourseAssignment,
  CorporateJobPosting,
  CorporateJobApplication,
  CorporateShortlist,
};