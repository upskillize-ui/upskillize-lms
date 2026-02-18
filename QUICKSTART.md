# Quick Start Guide - Upskillize LMS

Get your LMS running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- PostgreSQL v12+ installed
- Code editor (VS Code recommended)

## Installation

### 1. Quick Setup (Automated)

```bash
# Clone or extract the project
cd upskillize-lms

# Run setup script
chmod +x setup.sh
./setup.sh
```

### 2. Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

**Frontend:**
```bash
cd frontend
npm install
```

## Configuration

### Backend (.env)

Minimum required configuration:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=your_password
DB_NAME=upskillize_lms
JWT_SECRET=your_random_secret_min_32_characters
```

Optional but recommended:
```env
RESEND_API_KEY=re_xxx        # For emails
RAZORPAY_KEY_ID=rzp_test_xxx # For payments
RAZORPAY_KEY_SECRET=xxx      # For payments
```

### Database

Create the database:

```bash
# Using psql
createdb upskillize_lms

# Or manually
psql -U postgres
CREATE DATABASE upskillize_lms;
\q
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:5173

## First Steps

1. **Open your browser**: http://localhost:5173

2. **Register an account**:
   - Click "Register"
   - Choose role (Student/Faculty)
   - Fill in details
   - Click Register

3. **Login** with your credentials

4. **Explore**:
   - Students: Browse courses, enroll
   - Faculty: Create courses, manage content
   - Admin: Manage users, view analytics

## Default Test Users

After first setup, you can create test users:

**Student:**
- Email: student@test.com
- Password: student123

**Faculty:**
- Email: faculty@test.com
- Password: faculty123

**Admin:**
- Email: admin@test.com
- Password: admin123

## API Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Common Issues

### Port already in use

**Backend (5000):**
```bash
# Find process
lsof -i :5000
# Kill it
kill -9 <PID>
```

**Frontend (5173):**
```bash
# Find process
lsof -i :5173
# Kill it
kill -9 <PID>
```

### Database connection failed

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Verify credentials in .env

3. Create database if it doesn't exist

### Module not found

```bash
# Reinstall dependencies
cd backend && npm install
cd frontend && npm install
```

## Features to Try

### As a Student:
1. ✅ Register and login
2. ✅ Browse course catalog
3. ✅ Enroll in courses (free/paid)
4. ✅ Watch video lessons
5. ✅ Track progress
6. ✅ Take exams
7. ✅ View results

### As Faculty:
1. ✅ Create courses
2. ✅ Add modules and lessons
3. ✅ Upload video content
4. ✅ Create exams
5. ✅ Grade submissions
6. ✅ View student progress

### As Admin:
1. ✅ Manage all users
2. ✅ View analytics
3. ✅ Manage courses
4. ✅ Generate reports

## Next Steps

- [ ] Read full [README.md](README.md)
- [ ] Check [API documentation](README.md#api-documentation)
- [ ] Review [deployment guide](DEPLOYMENT.md)
- [ ] Customize branding and colors
- [ ] Set up payment gateway
- [ ] Configure email service
- [ ] Deploy to production

## Need Help?

- 📚 Full documentation: [README.md](README.md)
- 🚀 Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Issues: Create a GitHub issue
- 💬 Support: support@upskillize.com

---

Happy Learning! 🎓
