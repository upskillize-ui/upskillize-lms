const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const facultyRoutes = require("./routes/facultyProfile");
const { nudgeRouter, nudge } = require('./nudge_integration');
const passport = require("passport");
const path = require('path');

const { sequelize, testConnection } = require("./config/database");
const app = express();

// Trust Render's proxy (required for rate limiting on Render)
app.set("trust proxy", 1);

// ✅ Health check FIRST — before all middleware
app.get("/api/health", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ Compression — reduces response size by ~70%
app.use(compression());

// Security
app.use(helmet());

// ✅ CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://lms.upskillize.com",
        "https://www.upskillize.com",
        "https://upskillize.netlify.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS blocked:", origin);
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Serve video/content files with cross-origin headers ──────────────────────
app.use(
  "/uploads/content",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    next();
  },
  express.static(path.join(__dirname, "uploads", "content")),
);

// ── Serve ALL uploads (profile photos, resumes, etc.) ───────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(passport.initialize());

// ── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, please try again later." },
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/enrollments", require("./routes/enrollments"));
app.use("/api/modules", require("./routes/modules"));
app.use("/api/lessons", require("./routes/lessons"));
app.use("/api/video", require("./routes/video"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/results", require("./routes/results"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/student", require("./routes/student"));
app.use("/api/admin/dashboard", require("./routes/adminDashboard"));
app.use("/api/faculty", facultyRoutes);
app.use("/api/quizzes", require("./routes/quizzes"));
app.use("/api/forum", require("./routes/forum"));

// ── BrainDrill AI Agent routes ───────────────────────────────────────────────
app.use("/api/testgen", require("./routes/testgen"));
app.use("/api/test-sessions", require("./routes/testSessionRoutes"));
app.use("/api/attendance", require("./routes/attendance"));
app.use(nudgeRouter);
app.set('nudge', nudge);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ── Auto-migrate all profile columns on startup ───────────────────────────────
// Safely adds any missing columns for both student and faculty profiles.
// Skips columns that already exist — safe to run on every restart.
const autoMigrateAllColumns = async () => {
  const studentCols = [
    'education_level VARCHAR(100)', 'institution VARCHAR(255)',
    'graduation_year VARCHAR(10)', 'field_of_study VARCHAR(255)',
    'work_experience_years VARCHAR(50)', 'current_employer VARCHAR(255)',
    'current_designation VARCHAR(255)', 'skills TEXT',
    'languages VARCHAR(255)', 'certifications TEXT', 'hobbies VARCHAR(255)',
    'emergency_contact_name VARCHAR(255)', 'emergency_contact_phone VARCHAR(50)',
    'emergency_contact_relation VARCHAR(100)',
    'preferred_role VARCHAR(255)', 'preferred_location VARCHAR(255)',
    'preferred_salary_min VARCHAR(50)', 'preferred_salary_max VARCHAR(50)',
    'employment_type VARCHAR(100)', 'work_mode VARCHAR(100)',
    'notice_period VARCHAR(100)', 'open_to_relocation VARCHAR(20)',
    'industries VARCHAR(255)', 'company_size VARCHAR(100)',
    'key_skills TEXT', 'career_goals TEXT',
    'corporate_visible BOOLEAN DEFAULT TRUE',
    'resume_url VARCHAR(500)', 'resume_name VARCHAR(255)',
    'psycho_result TEXT',
    'linkedin VARCHAR(500)', 'github VARCHAR(500)',
    'twitter VARCHAR(500)', 'portfolio VARCHAR(500)',
    'street VARCHAR(255)', 'city VARCHAR(100)',
    'state VARCHAR(100)', 'country VARCHAR(100)', 'postal_code VARCHAR(20)',
    'bio TEXT', 'date_of_birth DATE', 'gender VARCHAR(20)',
    'profile_photo TEXT',
    `language VARCHAR(10) DEFAULT 'en'`,
    `timezone VARCHAR(50) DEFAULT 'Asia/Kolkata'`,
    'email_notifications BOOLEAN DEFAULT TRUE',
    'sms_notifications BOOLEAN DEFAULT FALSE',
    `theme VARCHAR(20) DEFAULT 'light'`,
    'two_factor_enabled BOOLEAN DEFAULT FALSE',
    'testgen_active BOOLEAN DEFAULT FALSE',
    'testgen_plan VARCHAR(50)',
    // Faculty-specific
    'phone VARCHAR(50)', 'phone_number VARCHAR(50)',
    'designation VARCHAR(255)', 'department VARCHAR(255)',
    'employee_id VARCHAR(100)', 'joining_date DATE',
    'qualification VARCHAR(255)', 'specialization VARCHAR(255)',
    'experience_years INT DEFAULT 0',
    'address_line1 VARCHAR(255)', 'address_line2 VARCHAR(255)',
    'achievements TEXT', 'publications TEXT',
    'languages_known VARCHAR(255)',
    'edu_degree VARCHAR(255)', 'edu_institution VARCHAR(255)',
    'edu_year VARCHAR(10)', 'edu_grade VARCHAR(50)',
    'website VARCHAR(500)',
    'account_holder_name VARCHAR(255)', 'bank_name VARCHAR(255)',
    'account_number VARCHAR(100)', 'ifsc_code VARCHAR(20)',
    'branch_name VARCHAR(255)', `account_type VARCHAR(50) DEFAULT 'savings'`,
    'pan_number VARCHAR(20)', 'uan_number VARCHAR(20)',
  ];

  let added = 0, skipped = 0;
  for (const col of studentCols) {
    const name = col.split(' ')[0];
    try {
      await sequelize.query(`ALTER TABLE users ADD COLUMN ${col}`);
      added++;
    } catch (e) {
      // errno 1060 = column already exists — safe to ignore
      if (e.original?.errno === 1060 || e.parent?.errno === 1060 ||
          e.message?.includes('Duplicate column') || e.message?.includes('already exists')) {
        skipped++;
      } else {
        console.warn(`[migrate] ⚠️  Column ${name}: ${e.message}`);
      }
    }
  }
  console.log(`[migrate] ✅ Profile columns ready — ${added} added, ${skipped} already existed`);
};

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: { drop: false } });
      console.log("✅ Database synced (dev mode)");
    } else {
      console.log("✅ Database connected (production — skipping sync)");
    }

    // Run profile column migration on every startup
    await autoMigrateAllColumns();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 BrainDrill: MAX_CONCURRENT = ${process.env.MAX_CONCURRENT_TESTS || 50}`);
      console.log(`⚡ BrainDrill Agent: ${process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;