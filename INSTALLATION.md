# 🚀 Upskillize LMS - Complete Installation Guide

## Prerequisites
- **Node.js**: 18.x or higher
- **MySQL**: 8.0 or higher
- **npm** or **yarn**

## Step 1: Database Setup

### Create MySQL Database
```sql
CREATE DATABASE upskillize_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Create Database User (Optional)
```sql
CREATE USER 'upskillize_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON upskillize_lms.* TO 'upskillize_user'@'localhost';
FLUSH PRIVILEGES;
```

## Step 2: Backend Setup

### Navigate to Backend Directory
```bash
cd backend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=upskillize_lms
DB_PORT=3306

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_long_and_secure_secret_key_minimum_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Resend.com)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=noreply@upskillize.com

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Verify Backend is Running
Visit: `http://localhost:5000/health`

You should see: `{"status":"OK","timestamp":"..."}`

## Step 3: Frontend Setup

### Navigate to Frontend Directory
```bash
cd ../frontend
```

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Create `.env` file:
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
echo "VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id" >> .env
```

### Start Frontend Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Step 4: Verify Installation

1. Open browser and visit: `http://localhost:5173`
2. You should see the Upskillize home page
3. Click "Register" to create a test account
4. Try logging in with your credentials

## Step 5: Create Admin User (Optional)

You can manually create an admin user in MySQL:

```sql
USE upskillize_lms;

-- First, create the user
INSERT INTO users (full_name, email, password_hash, role, is_active, created_at, updated_at)
VALUES ('Admin User', 'admin@upskillize.com', '$2a$10$YourHashedPasswordHere', 'admin', 1, NOW(), NOW());
```

Or register through the UI and then update the role in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
```

## Troubleshooting

### Backend won't start
- **Database connection error**: Check MySQL is running and credentials in `.env` are correct
- **Port already in use**: Change `PORT` in `.env` to a different port
- **Module not found**: Run `npm install` again

### Frontend won't start
- **Port 5173 in use**: Vite will automatically try the next available port
- **Can't connect to API**: Verify backend is running and `VITE_API_URL` is correct

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL exactly
- If using different ports, update both `.env` files accordingly

### Database Tables Not Created
- Check MySQL logs for errors
- Manually verify database exists: `SHOW DATABASES;`
- Sequelize will auto-create tables on first run

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile

### Courses
- `GET /api/courses` - List all active courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Faculty/Admin only)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Enrollments
- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments/my-enrollments` - Get student's enrollments
- `DELETE /api/enrollments/:id` - Withdraw from course

### Payments
- `POST /api/payments/initiate` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment and create enrollment
- `GET /api/payments/history` - Get payment history

### Exams
- `POST /api/exams/:id/start` - Start exam attempt
- `POST /api/exams/:id/submit` - Submit exam answers
- `GET /api/results/student/my-results` - Get all results

## Testing the System

### 1. Create Test Accounts
```bash
# Student Account
POST /api/auth/register
{
  "full_name": "Test Student",
  "email": "student@test.com",
  "password": "test123",
  "role": "student"
}

# Faculty Account  
POST /api/auth/register
{
  "full_name": "Test Faculty",
  "email": "faculty@test.com",
  "password": "test123",
  "role": "faculty"
}
```

### 2. Create Test Course (as Faculty)
Login as faculty, then:
```bash
POST /api/courses
{
  "course_name": "Introduction to React",
  "course_code": "REACT101",
  "description": "Learn React from scratch",
  "category": "Web Development",
  "price": 999.00,
  "difficulty_level": "beginner"
}
```

### 3. Enroll Student (as Student)
```bash
POST /api/enrollments
{
  "course_id": 1
}
```

## Production Deployment

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add all environment variables
4. Set start command: `node server.js`
5. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Add environment variables
4. Configure domain

### Database (PlanetScale/Render)
- Use managed MySQL service
- Enable SSL connections
- Update `DB_HOST` and credentials in backend `.env`

## Next Steps

1. ✅ Complete course module and lesson CRUD operations
2. ✅ Implement video player with YouTube integration
3. ✅ Add exam creation and submission system
4. ✅ Integrate Razorpay payment gateway
5. ✅ Create analytics dashboard
6. ✅ Add email notifications
7. ✅ Implement file upload for course materials
8. ✅ Add real-time chat/discussion forums
9. ✅ Create certificate generation
10. ✅ Add mobile responsiveness

## Support

For issues or questions:
- Check the README.md file
- Review this installation guide
- Check console logs for errors
- Verify all environment variables are set correctly

## License

MIT License - See LICENSE file for details

---

**Happy Learning with Upskillize! 🎓**
