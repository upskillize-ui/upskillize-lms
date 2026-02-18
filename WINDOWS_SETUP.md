# 🪟 Windows Setup Guide for Upskillize LMS

## Prerequisites Installation

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (18.x or higher)
- Run installer, check "Add to PATH"
- Verify installation:
  ```powershell
  node --version
  npm --version
  ```

### 2. Install MySQL
- Download from: https://dev.mysql.com/downloads/installer/
- Choose "MySQL Installer for Windows"
- Select "Developer Default" during installation
- Set root password (remember this!)
- Verify installation:
  ```powershell
  mysql --version
  ```

### 3. Install Git (Optional but recommended)
- Download from: https://git-scm.com/download/win
- Use default settings during installation

## Quick Setup (Copy & Paste in PowerShell)

### Step 1: Navigate to Project
```powershell
cd C:\Users\DELL\Downloads\upskillize-lms
```

### Step 2: Check Structure
```powershell
dir
# You should see: backend, frontend, database folders
```

### Step 3: Setup Backend

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env file
notepad .env
```

**Edit the .env file with these values:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_root_password
DB_NAME=upskillize_lms
DB_PORT=3306

JWT_SECRET=upskillize_super_secret_key_min_32_characters_long_12345

PORT=5000
NODE_ENV=development

RESEND_API_KEY=re_123456789
FROM_EMAIL=noreply@upskillize.com

RAZORPAY_KEY_ID=rzp_test_123456789
RAZORPAY_KEY_SECRET=secret123456789

CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Step 4: Create Database

Open MySQL Command Line Client (or MySQL Workbench) and run:
```sql
CREATE DATABASE upskillize_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use PowerShell:
```powershell
mysql -u root -p -e "CREATE DATABASE upskillize_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 5: Start Backend

```powershell
# Still in backend folder
npm run dev
```

You should see:
```
✅ Database connection established successfully.
✅ Database synced
🚀 Server running on port 5000
🌍 Environment: development
```

Keep this window open!

### Step 6: Setup Frontend (New PowerShell Window)

```powershell
# Open NEW PowerShell window
cd C:\Users\DELL\Downloads\upskillize-lms\frontend

# Install dependencies
npm install

# Create .env file
New-Item -Path .env -ItemType File

# Add to .env
Add-Content .env "VITE_API_URL=http://localhost:5000/api"
Add-Content .env "VITE_RAZORPAY_KEY_ID=rzp_test_123456789"
```

Or manually create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_123456789
```

### Step 7: Start Frontend

```powershell
# In frontend folder
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 8: Access Application

Open browser and go to: **http://localhost:5173**

## Troubleshooting Windows Issues

### Issue 1: "Cannot find path"
**Solution:**
```powershell
# Check where you are
pwd

# List files
dir

# Navigate correctly
cd C:\Users\DELL\Downloads\upskillize-lms
dir  # Should show backend, frontend folders
```

### Issue 2: "npm is not recognized"
**Solution:**
- Restart PowerShell after installing Node.js
- Or restart computer
- Verify: `node --version`

### Issue 3: MySQL connection error
**Solution:**
```powershell
# Test MySQL connection
mysql -u root -p

# If fails, check MySQL service is running:
# Windows Services -> MySQL80 -> Start
```

### Issue 4: Port already in use
**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend/.env
# PORT=5001
```

### Issue 5: "execution of scripts is disabled"
**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 6: Missing frontend files
**Solution:**
```powershell
# Verify frontend structure
cd C:\Users\DELL\Downloads\upskillize-lms\frontend
dir
dir src
dir src\pages

# If missing, re-extract the zip file
```

## File Structure Check

Your directory should look like this:

```
C:\Users\DELL\Downloads\upskillize-lms\
├── backend\
│   ├── config\
│   ├── middleware\
│   ├── models\
│   ├── routes\
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend\
│   ├── src\
│   │   ├── components\
│   │   ├── pages\
│   │   ├── context\
│   │   ├── services\
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── .env
├── database\
│   └── schema.sql
├── README.md
├── INSTALLATION.md
└── QUICK_START.md
```

## Verify Installation

Run this in PowerShell:
```powershell
cd C:\Users\DELL\Downloads\upskillize-lms

# Check backend
Test-Path backend\package.json
Test-Path backend\server.js

# Check frontend  
Test-Path frontend\package.json
Test-Path frontend\src\App.jsx

# All should return: True
```

## Quick Commands Reference

```powershell
# Backend (Terminal 1)
cd C:\Users\DELL\Downloads\upskillize-lms\backend
npm install
npm run dev

# Frontend (Terminal 2)
cd C:\Users\DELL\Downloads\upskillize-lms\frontend
npm install
npm run dev

# MySQL
mysql -u root -p
CREATE DATABASE upskillize_lms;
EXIT;
```

## After Setup

1. **Register**: http://localhost:5173/register
2. **Login**: http://localhost:5173/login
3. **Create course** (if faculty)
4. **Enroll** (if student)

## Getting Help

1. Check if both terminals are running (backend + frontend)
2. Check browser console for errors (F12)
3. Check backend terminal for errors
4. Verify database exists: `mysql -u root -p` then `SHOW DATABASES;`

## Production Deployment

See `DEPLOYMENT.md` for deploying to:
- Render.com (Free tier)
- Railway.app (Free tier)
- Your own VPS

---

**Need more help?** Check the other documentation files or create an issue.

Happy coding on Windows! 🪟✨
