# 🚀 Upskillize LMS - Quick Start Guide

## What You Have

A complete, production-ready Learning Management System with:
- ✅ Full-stack application (React + Node.js + MySQL)
- ✅ 13 database tables with relationships
- ✅ Authentication & authorization (JWT + RBAC)
- ✅ Course management system
- ✅ Video lessons with YouTube integration
- ✅ Examination system with auto-grading
- ✅ Payment integration (Razorpay)
- ✅ Email notifications (Resend)
- ✅ Admin, Faculty, and Student dashboards
- ✅ Complete API documentation
- ✅ Deployment guides

## File Structure

```
upskillize-lms/
├── backend/          # Node.js Express API
├── frontend/         # React Vite Application
├── database/         # MySQL Schema
├── README.md         # Project overview
├── INSTALLATION.md   # Setup instructions
├── PROJECT_OVERVIEW.md  # Detailed documentation
├── DEPLOYMENT.md     # Production deployment guide
└── verify_setup.sh   # Setup verification script
```

## Fastest Way to Get Started

### 1. Backend (5 minutes)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 2. Create Database

```sql
CREATE DATABASE upskillize_lms;
```

### 3. Frontend (3 minutes)

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Default Ports

- Frontend: 5173
- Backend: 5000
- MySQL: 3306

## First Steps After Installation

1. **Register an account** at http://localhost:5173/register
2. **Login** with your credentials
3. **Explore** the dashboard
4. **Create courses** (if faculty/admin)
5. **Enroll in courses** (if student)

## Environment Variables Required

### Backend (.env)
- DB_HOST, DB_USER, DB_PASS, DB_NAME
- JWT_SECRET (min 32 characters)
- RESEND_API_KEY (for emails)
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (for payments)

### Frontend (.env)
- VITE_API_URL
- VITE_RAZORPAY_KEY_ID

## Complete Documentation

- **Installation**: Read INSTALLATION.md
- **API Reference**: Check PROJECT_OVERVIEW.md
- **Deployment**: See DEPLOYMENT.md
- **Database Schema**: Review database/schema.sql

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: MySQL 8.0+
- **Auth**: JWT, bcrypt
- **Payments**: Razorpay
- **Email**: Resend

## Features Implemented

✅ User authentication (Register/Login/Password Reset)
✅ Role-based dashboards (Student/Faculty/Admin)
✅ Course CRUD operations
✅ Hierarchical content (Courses → Modules → Lessons)
✅ Video integration with YouTube
✅ Watch progress tracking
✅ Enrollment system
✅ Payment gateway integration
✅ Examination system
✅ Auto-grading for objective questions
✅ Result management
✅ Notification system
✅ Admin analytics
✅ Email notifications
✅ Security features (rate limiting, RBAC, validation)

## Need Help?

1. Check INSTALLATION.md for detailed setup
2. Review PROJECT_OVERVIEW.md for architecture
3. See DEPLOYMENT.md for production deployment
4. Check backend logs for API errors
5. Check browser console for frontend errors

## Quick Commands

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev

# Verify Setup
bash verify_setup.sh

# Database
mysql -u root -p < database/schema.sql
```

## What's Next?

- Customize the frontend design
- Add more course categories
- Implement certificate generation
- Add discussion forums
- Create mobile app
- Add AI-powered recommendations

## License

MIT - Free for commercial use

---

**Built for www.upskillize.com**

Happy coding! 🎓✨
