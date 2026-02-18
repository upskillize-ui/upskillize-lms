# 📚 Upskillize LMS - Complete Project Overview

## 🎯 Project Description

Upskillize is a comprehensive Learning Management System (LMS) built for www.upskillize.com. It provides a complete platform for online education with features for students, faculty, and administrators.

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with Hooks
- Vite (Build tool)
- React Router v6 (Navigation)
- Axios (HTTP client)
- Tailwind CSS (Styling)
- Lucide React (Icons)

**Backend:**
- Node.js 18+
- Express.js (Web framework)
- Sequelize ORM (Database)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Express Validator (Input validation)

**Database:**
- MySQL 8.0+
- 13 Tables with relationships

**Third-Party Services:**
- Razorpay (Payment gateway)
- Resend (Email service)
- YouTube API (Video hosting)

## 📦 Project Structure

```
upskillize-lms/
├── backend/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   ├── email.js             # Email service config
│   │   └── razorpay.js          # Payment config
│   │
│   ├── models/
│   │   ├── index.js             # Model associations
│   │   ├── User.js              # User model
│   │   ├── Student.js           # Student profile
│   │   ├── Faculty.js           # Faculty profile
│   │   ├── Course.js            # Course information
│   │   ├── CourseModule.js      # Course modules
│   │   ├── Lesson.js            # Individual lessons
│   │   ├── Enrollment.js        # Student enrollments
│   │   ├── VideoWatchHistory.js # Video progress tracking
│   │   ├── Exam.js              # Exam details
│   │   ├── Question.js          # Exam questions
│   │   ├── Result.js            # Exam results
│   │   ├── Notification.js      # User notifications
│   │   └── Payment.js           # Payment records
│   │
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── courses.js           # Course CRUD
│   │   ├── enrollments.js       # Enrollment management
│   │   ├── modules.js           # Module CRUD
│   │   ├── lessons.js           # Lesson CRUD
│   │   ├── video.js             # Video tracking
│   │   ├── payments.js          # Payment processing
│   │   ├── exams.js             # Exam management
│   │   ├── results.js           # Result management
│   │   ├── notifications.js     # Notification system
│   │   └── admin.js             # Admin operations
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── rbac.js              # Role-based access control
│   │   └── validate.js          # Input validation
│   │
│   ├── server.js                # Main server file
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── ExamTimer.jsx
│   │   │   └── PaymentModal.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Student/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyCourses.jsx
│   │   │   │   ├── CourseView.jsx
│   │   │   │   └── ExamAttempt.jsx
│   │   │   ├── Faculty/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ManageCourses.jsx
│   │   │   │   └── CreateExam.jsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Analytics.jsx
│   │   │       └── UserManagement.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   │
│   │   ├── services/
│   │   │   └── api.js           # Axios instance
│   │   │
│   │   ├── config/
│   │   │   └── constants.js     # App constants
│   │   │
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── database/
│   └── schema.sql               # MySQL schema
│
├── README.md
└── INSTALLATION.md
```

## 🔑 Key Features

### 1. User Management
- Multi-role system (Student, Faculty, Admin)
- JWT-based authentication
- Role-based access control (RBAC)
- User profiles with additional role-specific data
- Password reset functionality

### 2. Course Management
- Create, read, update, delete courses
- Hierarchical structure: Course → Modules → Lessons
- Course categories and difficulty levels
- Faculty assignment
- Course thumbnails and descriptions
- Prerequisites and learning outcomes

### 3. Content Delivery
- YouTube video integration
- Multiple content types (video, PDF, PPT, text)
- Preview lessons for non-enrolled students
- Sequential content organization

### 4. Video System
- YouTube IFrame API integration
- Watch progress tracking
- Video completion percentage
- Access control (enrolled users only)
- Watch time analytics

### 5. Enrollment System
- Course enrollment with validation
- Free and paid courses
- Enrollment status tracking
- Progress percentage calculation
- Withdrawal functionality

### 6. Payment Integration
- Razorpay payment gateway
- Secure payment verification
- Payment history tracking
- Multiple payment statuses
- Automatic enrollment after payment

### 7. Examination System
- Multiple question types (MCQ, True/False, Short Answer, Essay)
- Timed exams with countdown
- Question randomization
- Auto-grading for objective questions
- Manual grading support for subjective answers
- Attempt tracking
- Result publishing workflow

### 8. Results & Grading
- Automated scoring
- Grade calculation (A+, A, B, C, F)
- Result status management (draft, published, pending review)
- Student result history
- Downloadable result PDFs (future feature)

### 9. Notification System
- Email notifications via Resend
- In-app notification center
- Multiple notification types
- Read/unread status
- Notification links for quick navigation

### 10. Admin Dashboard
- User management
- Course approval
- System analytics
- Revenue tracking
- User suspension/activation
- Comprehensive reporting

### 11. Analytics & Reporting
- Enrollment statistics
- Revenue reports
- Course popularity metrics
- Student progress tracking
- Faculty performance overview

## 🔒 Security Features

1. **Authentication**
   - JWT tokens with 7-day expiry
   - Secure password hashing (bcrypt, 10 rounds)
   - Token validation on all protected routes

2. **Authorization**
   - Role-based access control
   - Resource-level permissions
   - Faculty can only edit their own courses

3. **Rate Limiting**
   - General API: 100 requests/15 minutes
   - Auth endpoints: 10 requests/15 minutes

4. **Input Validation**
   - Express-validator for all inputs
   - SQL injection protection via Sequelize ORM
   - XSS protection through React's built-in escaping

5. **Security Headers**
   - Helmet.js for security headers
   - CORS with origin whitelist
   - Cookie security settings

6. **Data Protection**
   - Password reset tokens with expiry
   - Sensitive data exclusion in API responses
   - Environment variable protection

## 🗄️ Database Schema

### Core Tables
1. **users** - User accounts
2. **students** - Student profiles
3. **faculty** - Faculty profiles
4. **courses** - Course information
5. **course_modules** - Course structure
6. **lessons** - Learning content
7. **enrollments** - Student-course relationships
8. **video_watch_history** - Video progress
9. **exams** - Exam definitions
10. **questions** - Exam questions
11. **results** - Exam scores
12. **notifications** - User notifications
13. **payments** - Payment records

### Key Relationships
- User → Student/Faculty (1:1)
- Faculty → Courses (1:N)
- Course → Modules (1:N)
- Module → Lessons (1:N)
- Student + Course → Enrollment (N:M)
- Student + Lesson → WatchHistory (N:M)
- Course → Exams (1:N)
- Exam → Questions (1:N)
- Student + Exam → Results (N:M)

## 🌐 API Architecture

### RESTful Design
- Consistent endpoint naming
- HTTP methods: GET, POST, PUT, DELETE
- Standard response format:
  ```json
  {
    "success": true/false,
    "message": "...",
    "data": {...}
  }
  ```

### Authentication Flow
1. User registers/logs in
2. Server generates JWT token
3. Client stores token in localStorage
4. Token sent in Authorization header
5. Server validates token on protected routes

### Payment Flow
1. Student selects paid course
2. Backend creates Razorpay order
3. Frontend opens Razorpay checkout
4. User completes payment
5. Razorpay callback with signature
6. Backend verifies signature
7. Creates enrollment record
8. Sends confirmation email

## 📱 Frontend Architecture

### State Management
- React Context API for authentication
- Local state for component-specific data
- Custom hooks for reusable logic

### Routing
- React Router v6
- Protected routes with role checking
- Lazy loading for code splitting
- Nested routes for dashboards

### API Communication
- Axios instance with interceptors
- Automatic token attachment
- Error handling and retry logic
- Request/response logging

## 🚀 Performance Optimizations

1. **Backend**
   - Database indexing on frequently queried fields
   - Lazy loading with Sequelize includes
   - Connection pooling
   - Response caching (future)

2. **Frontend**
   - Code splitting with React.lazy
   - Image optimization
   - Memoization for expensive calculations
   - Virtual scrolling for long lists (future)

3. **Database**
   - Proper indexing strategy
   - Query optimization
   - Avoiding N+1 queries

## 📈 Scalability Considerations

1. **Horizontal Scaling**
   - Stateless backend design
   - Session data in JWT (not server)
   - Load balancer ready

2. **Database Scaling**
   - Read replicas support
   - Connection pooling
   - Query optimization

3. **Caching Strategy**
   - Redis for session storage (future)
   - Static asset CDN
   - API response caching

## 🧪 Testing Strategy

### Backend Testing
- Unit tests for models
- Integration tests for routes
- API endpoint testing

### Frontend Testing
- Component unit tests
- Integration tests
- E2E tests with Cypress (future)

## 📋 Development Roadmap

### Phase 1: Core Features ✅
- User authentication
- Course CRUD
- Basic enrollment

### Phase 2: Content Delivery ✅
- Video integration
- Module structure
- Progress tracking

### Phase 3: Assessment 🔄
- Exam creation
- Question bank
- Auto-grading

### Phase 4: Payments 🔄
- Razorpay integration
- Payment verification
- Transaction history

### Phase 5: Enhancements 🔜
- Discussion forums
- Live classes
- Certificate generation
- Mobile app
- AI recommendations

## 🛠️ Environment Setup

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend  
npm install
npm run dev
```

### Production
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
NODE_ENV=production npm start
```

## 📞 Support & Maintenance

### Monitoring
- Server health checks
- Error logging
- Performance monitoring
- Uptime tracking

### Backup Strategy
- Daily database backups
- Automated backup rotation
- Disaster recovery plan

### Updates
- Regular dependency updates
- Security patch deployment
- Feature releases

## 📄 License

MIT License - Free for commercial and personal use

---

**Built with ❤️ for www.upskillize.com**
