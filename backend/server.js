const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const facultyRoutes = require("./routes/facultyProfile");
const passport = require("passport");

const { sequelize, testConnection } = require("./config/database");
const { authenticate: authMiddleware } = require("./middleware/auth"); // ✅ Import auth middleware
const app = express();

// Trust Render's proxy (required for rate limiting on Render)
app.set("trust proxy", 1);

// ✅ FIX 1: Health check FIRST — before all middleware
// ✅ Replace with — allows CORS from browser fetch
app.get("/api/health", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ FIX 2: Add compression — reduces response size by ~70%
app.use(compression());

// Middleware
app.use(helmet());

// ✅ FIX 3: Fix CORS — replace placeholder with real env variable
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

// ── Serve video/content files with cross-origin headers ─────
// Fixes: ERR_BLOCKED_BY_RESPONSE.NotSameOrigin on <video> elements
app.use(
  "/uploads/content",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    next();
  },
  express.static("uploads/content"),
);

// ── Serve all other uploads (profile photos, docs) normally ─
app.use("/uploads", express.static("uploads"));

// ✅ FIX 4: REMOVED session middleware — you use JWT, not sessions
// Sessions add DB/memory overhead on EVERY request for no benefit
// app.use(session(...))  ← DELETED

app.use(passport.initialize());
// app.use(passport.session()) ← also not needed for JWT

// ✅ FIX 5: Looser auth rate limit — 10 was too aggressive
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // ✅ increased from 10 → 20 (10 was too strict for real users)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ── Routes ───────────────────────────────────────────────────────────────
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

// ✅ PROTECTED ROUTES — require authentication
app.use("/api/testgen", require("./routes/testgen"));

// app.use("/api/test-sessions", require("./routes/testSessionRoutes"));

// ── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Error handler ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ✅ FIX 6: Don't run sequelize.sync() on every start in production
// It checks every table schema — very slow with many models
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    // Only sync in development — in production DB schema is already set
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database synced (dev mode)");
    } else {
      console.log("✅ Database connected (production — skipping sync)");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `📊 Test sessions: MAX_CONCURRENT = ${process.env.MAX_CONCURRENT_TESTS || 50}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
