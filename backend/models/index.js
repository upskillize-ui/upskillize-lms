const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Student = require('./Student');
const Faculty = require('./Faculty');
const Course = require('./Course');
const CourseModule = require('./CourseModule');
const Lesson = require('./Lesson');
const Enrollment = require('./Enrollment');
const VideoWatchHistory = require('./VideoWatchHistory');
const Exam = require('./Exam');
const Question = require('./Question');
const Result = require('./Result');
const Notification = require('./Notification');
const Payment = require('./Payment');

// Define associations
// User associations
User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Faculty, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Faculty.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Faculty and Course associations
Faculty.hasMany(Course, { foreignKey: 'faculty_id' });
Course.belongsTo(Faculty, { foreignKey: 'faculty_id' });

// Course and Module associations
Course.hasMany(CourseModule, { foreignKey: 'course_id', onDelete: 'CASCADE' });
CourseModule.belongsTo(Course, { foreignKey: 'course_id' });

// Module and Lesson associations
CourseModule.hasMany(Lesson, { foreignKey: 'course_module_id', onDelete: 'CASCADE' });
Lesson.belongsTo(CourseModule, { foreignKey: 'course_module_id' });

// Enrollment associations
Student.hasMany(Enrollment, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Enrollment.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Enrollment, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id' });

// Video Watch History associations
Student.hasMany(VideoWatchHistory, { foreignKey: 'student_id', onDelete: 'CASCADE' });
VideoWatchHistory.belongsTo(Student, { foreignKey: 'student_id' });

Lesson.hasMany(VideoWatchHistory, { foreignKey: 'lesson_id', onDelete: 'CASCADE' });
VideoWatchHistory.belongsTo(Lesson, { foreignKey: 'lesson_id' });

// Exam and Course associations
Course.hasMany(Exam, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Exam.belongsTo(Course, { foreignKey: 'course_id' });

// Exam and Question associations
Exam.hasMany(Question, { foreignKey: 'exam_id', onDelete: 'CASCADE' });
Question.belongsTo(Exam, { foreignKey: 'exam_id' });

// Result associations
Student.hasMany(Result, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Result.belongsTo(Student, { foreignKey: 'student_id' });

Exam.hasMany(Result, { foreignKey: 'exam_id', onDelete: 'CASCADE' });
Result.belongsTo(Exam, { foreignKey: 'exam_id' });

// Payment associations
Student.hasMany(Payment, { foreignKey: 'student_id', onDelete: 'CASCADE' });
Payment.belongsTo(Student, { foreignKey: 'student_id' });

Course.hasMany(Payment, { foreignKey: 'course_id' });
Payment.belongsTo(Course, { foreignKey: 'course_id' });

Enrollment.hasMany(Payment, { foreignKey: 'enrollment_id' });
Payment.belongsTo(Enrollment, { foreignKey: 'enrollment_id' });

// Export all models
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
  Payment
};
