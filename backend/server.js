const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression'); // ADD THIS
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const facultyRoutes = require('./routes/facultyProfile');
const passport = require('passport');

const { sequelize, testConnection } = require('./config/database');
const app = express();

// Trust Render's proxy (required for rate limiting on Render)
app.set('trust proxy', 1);

// ✅ FIX 1: Health check FIRST — before all middleware
// This ensures UptimeRobot ping responds instantly without going through
// helmet, cors, rate limiting etc.
app.get('/api/health', (req, res) => {
  // Explicitly set CORS for health check so browser fetch works
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ FIX 2: Add compression — reduces response size by ~70%
app.use(compression());

// Middleware
app.use(helmet());

// ✅ FIX 3: Fix CORS — replace placeholder with real env variable
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,           // set this in Render env vars
      process.env.FRONTEND_URL,          // backup
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, UptimeRobot)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ✅ FIX 4: REMOVED session middleware — you use JWT, not sessions
// Sessions add DB/memory overhead on EVERY request for no benefit
// app.use(session(...))  ← DELETED

app.use(passport.initialize());
// app.use(passport.session()) ← also not needed for JWT

// ✅ FIX 5: Looser auth rate limit — 10 was too aggressive
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,   // Return rate limit info in headers
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,  // ✅ increased from 10 → 20 (10 was too strict for real users)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/video', require('./routes/video'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/exams', require('./routes/exams'));
app.use('/api/results', require('./routes/results'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/student', require('./routes/student'));
app.use('/api/admin/dashboard', require('./routes/adminDashboard'));
app.use('/api/faculty', facultyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ FIX 6: Don't run sequelize.sync() on every start in production
// It checks every table schema — very slow with many models
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    // Only sync in development — in production DB schema is already set
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced (dev mode)');
    } else {
      console.log('✅ Database connected (production — skipping sync)');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;