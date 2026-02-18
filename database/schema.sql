-- Upskillize LMS Database Schema
-- MySQL 8.0+

-- Create Database
CREATE DATABASE IF NOT EXISTS upskillize_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE upskillize_lms;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'faculty', 'admin') DEFAULT 'student' NOT NULL,
  phone VARCHAR(20),
  profile_photo VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  reset_token VARCHAR(255),
  reset_token_expiry DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  enrollment_number VARCHAR(50) UNIQUE,
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  qualifications TEXT,
  subjects TEXT,
  bio TEXT,
  experience_years INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  duration_hours INT,
  price DECIMAL(10, 2) DEFAULT 0.00,
  thumbnail VARCHAR(255),
  faculty_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  language VARCHAR(50) DEFAULT 'English',
  prerequisites TEXT,
  learning_outcomes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id),
  INDEX idx_category (category),
  INDEX idx_faculty (faculty_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_sequence (sequence_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_module_id INT NOT NULL,
  lesson_name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_order INT NOT NULL DEFAULT 0,
  content_type ENUM('video', 'pdf', 'ppt', 'text', 'quiz') DEFAULT 'video',
  content_url VARCHAR(500),
  youtube_video_id VARCHAR(50),
  duration_minutes INT,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
  INDEX idx_module_id (course_module_id),
  INDEX idx_sequence (sequence_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  completion_status ENUM('enrolled', 'in_progress', 'completed', 'withdrawn') DEFAULT 'enrolled',
  payment_status ENUM('pending', 'paid', 'failed', 'partial', 'refunded') DEFAULT 'pending',
  progress_percentage DECIMAL(5, 2) DEFAULT 0.00,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, course_id),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_status (completion_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Video Watch History Table
CREATE TABLE IF NOT EXISTS video_watch_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  lesson_id INT NOT NULL,
  total_watch_time INT DEFAULT 0 COMMENT 'Total watch time in seconds',
  last_position INT DEFAULT 0 COMMENT 'Last watched position in seconds',
  completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
  watch_count INT DEFAULT 0,
  last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_watch (student_id, lesson_id),
  INDEX idx_student (student_id),
  INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  exam_name VARCHAR(255) NOT NULL,
  exam_type ENUM('quiz', 'midterm', 'final', 'mock', 'assignment') DEFAULT 'quiz',
  description TEXT,
  total_marks INT NOT NULL,
  passing_marks INT NOT NULL,
  duration_minutes INT NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  shuffle_questions BOOLEAN DEFAULT TRUE,
  show_results_immediately BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course (course_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('mcq', 'true_false', 'short_answer', 'essay') DEFAULT 'mcq',
  marks INT NOT NULL DEFAULT 1,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  options JSON COMMENT 'Array of options for MCQ',
  correct_answer VARCHAR(500) NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam (exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Results Table
CREATE TABLE IF NOT EXISTS results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  score DECIMAL(10, 2) NOT NULL,
  total_marks INT NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,
  grade VARCHAR(5),
  result_status ENUM('draft', 'published', 'pending_review') DEFAULT 'draft',
  answers JSON COMMENT 'Student answers',
  attempt_number INT DEFAULT 1,
  time_taken_minutes INT,
  started_at DATETIME,
  submitted_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_exam (exam_id),
  INDEX idx_status (result_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('assignment', 'exam', 'announcement', 'result', 'enrollment', 'payment', 'general') DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method ENUM('razorpay', 'stripe', 'paypal', 'free') DEFAULT 'razorpay',
  payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),
  transaction_id VARCHAR(100),
  failure_reason TEXT,
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
  INDEX idx_student (student_id),
  INDEX idx_course (course_id),
  INDEX idx_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Admin User (password: admin123)
INSERT INTO users (full_name, email, password_hash, role, is_active) 
VALUES ('System Admin', 'admin@upskillize.com', '$2a$10$YourBcryptHashHere', 'admin', 1)
ON DUPLICATE KEY UPDATE id=id;

-- Sample Course Categories Data
-- INSERT INTO courses (course_name, course_code, description, category, price, difficulty_level)
-- VALUES 
-- ('Introduction to React', 'REACT101', 'Learn React fundamentals', 'Web Development', 999.00, 'beginner'),
-- ('Advanced Node.js', 'NODE201', 'Master Node.js backend development', 'Web Development', 1499.00, 'advanced');

COMMIT;
