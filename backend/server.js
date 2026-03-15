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
  express.static("uploads/content"),
);

// ── Serve all other uploads ──────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

app.use(passport.initialize());

// ── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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
app.use("/api/testgen", require("./routes/testgen")); // student test generation
app.use("/api/test-sessions", require("./routes/testSessionRoutes")); // ✅ UNCOMMENTED — admin monitor + slot stats

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

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

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
        `📊 BrainDrill: MAX_CONCURRENT = ${process.env.MAX_CONCURRENT_TESTS || 50}`,
      );
      console.log(
        `⚡ BrainDrill Agent: ${process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space"}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
