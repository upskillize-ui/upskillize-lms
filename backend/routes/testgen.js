/**
 * testgen.js — Express router
 * Connects your React frontend ↔ RAG FastAPI agent.
 *
 * What's added vs original:
 *  ✅ Rate limiting per student (3 generates/hour, in-memory)
 *  ✅ Max concurrent test-takers (configurable, in-memory)
 *  ✅ One active test per student at a time
 *  ✅ Enrollment check before test generation
 *  ✅ Slot released on submit
 *  ✅ /status endpoint — agent health + current occupancy
 *  ✅ Input validation (topic length, sanitization)
 *  ✅ Proper error propagation from agent
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const testSessionManager = require("../Testsessionmanager");

// ✅ Import middleware using CORRECT export names from auth.js
const authMiddleware = require("../middleware/auth"); // Default export
const rbac = require("../middleware/rbac");

const AGENT =
  process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space";
const TIMEOUT_GENERATE = 90_000;
const TIMEOUT_SUBMIT = 30_000;

// ── DB import ──────────────────────────────────────────────────────────────────
let db;
try {
  db = require("../config/database");
} catch {
  console.warn(
    "[TestGen] db module not found — enrollment check will be skipped",
  );
  db = null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function studentId(req) {
  return req.user ? String(req.user.id) : "student_demo";
}

/** Returns true if the student is enrolled in a course containing lectureId or courseId */
async function isEnrolled(userId, lectureId, courseId) {
  if (!db) return true; // skip if db not configured

  try {
    // Adjust this query to match your actual schema
    const query = courseId
      ? `SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1`
      : `SELECT 1 FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN course_modules cm ON cm.course_id = c.id
         JOIN lessons l ON l.course_module_id = cm.id
         WHERE e.student_id = ? AND l.id = ? LIMIT 1`;

    const params = courseId ? [userId, courseId] : [userId, lectureId];
    const [rows] = await db.query(query, params);
    return rows.length > 0;
  } catch (err) {
    console.error("[TestGen] Enrollment check failed:", err.message);
    return true; // fail open — don't block student due to DB error
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * GET /api/testgen/health — agent health + slot availability
 */
router.get("/health", async (req, res) => {
  try {
    const { data } = await axios.get(`${AGENT}/api/health`, { timeout: 5000 });
    const stats = testSessionManager.getStats();
    return res.json({
      success: true,
      agent: data,
      slots: {
        activeTestTakers: stats.activeTestTakers,
        maxConcurrent: stats.maxConcurrent,
        availableSlots: stats.availableSlots,
        occupancyPercent: stats.occupancyPercent,
        timestamp: stats.timestamp,
      },
    });
  } catch (err) {
    const stats = testSessionManager.getStats();
    return res.status(503).json({
      success: false,
      message: "Agent unavailable",
      error: err.message,
      slots: {
        activeTestTakers: stats.activeTestTakers,
        maxConcurrent: stats.maxConcurrent,
        availableSlots: stats.availableSlots,
        occupancyPercent: stats.occupancyPercent,
        timestamp: stats.timestamp,
      },
    });
  }
});

/**
 * GET /api/testgen/status — current session occupancy
 */
router.get("/status", (req, res) => {
  const stats = testSessionManager.getStats();
  res.json({
    success: true,
    data: {
      activeTestTakers: stats.activeTestTakers,
      maxConcurrent: stats.maxConcurrent,
      availableSlots: stats.availableSlots,
      occupancyPercent: stats.occupancyPercent,
      timestamp: stats.timestamp,
    },
  });
});

/**
 * POST /api/testgen/generate — generate a mock test
 * Protected - Student only
 */
router.post(
  "/generate",
  authMiddleware,
  rbac(["student"]),
  async (req, res) => {
    const sid = studentId(req);

    const {
      lectureId,
      courseId,
      topic,
      numQuestions,
      durationMinutes,
      difficulty,
      questionTypes,
    } = req.body;

    // ── Input validation ───────────────────────────────────────────────────────
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "topic is required" });
    }
    if (topic.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "topic must be under 200 characters",
      });
    }
    if (!lectureId && !courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Provide lectureId or courseId" });
    }

    // ── Rate limit check ───────────────────────────────────────────────────────
    const rateLimitCheck = testSessionManager.checkRateLimit(sid);
    if (rateLimitCheck.limited) {
      res.set("Retry-After", rateLimitCheck.retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
      });
    }

    // ── Enrollment check ───────────────────────────────────────────────────────
    const enrolled = await isEnrolled(sid, lectureId, courseId);
    if (!enrolled) {
      return res.status(403).json({
        success: false,
        message:
          "You are not enrolled in this course. Please enroll before generating a test.",
      });
    }

    // ── Acquire concurrent slot ────────────────────────────────────────────────
    const slot = testSessionManager.acquireSlot(sid);
    if (!slot.ok) {
      return res.status(429).json({ success: false, message: slot.reason });
    }

    // ── Record rate limit hit ──────────────────────────────────────────────────
    testSessionManager.recordGeneration(sid);

    try {
      const { data } = await axios.post(
        `${AGENT}/api/generate-test`,
        {
          topic: topic.trim(),
          lecture_id: lectureId || null,
          course_id: courseId || null,
          num_questions: Math.min(Math.max(numQuestions || 10, 1), 50),
          duration_minutes: Math.min(Math.max(durationMinutes || 30, 5), 180),
          difficulty: ["easy", "medium", "hard", "complex"].includes(difficulty)
            ? difficulty
            : "medium",
          question_types:
            Array.isArray(questionTypes) && questionTypes.length
              ? questionTypes
              : ["mcq"],
          student_id: sid,
        },
        { timeout: TIMEOUT_GENERATE },
      );

      // Don't release the slot here — hold it until /submit is called.
      return res.json({ success: true, ...data });
    } catch (err) {
      // Release slot on failure so they can try again
      testSessionManager.releaseSlot(sid);
      const status = err.response?.status || 500;
      const message = err.response?.data?.detail || err.message;
      console.error(`[TestGen] generate failed for student ${sid}:`, message);
      return res.status(status).json({ success: false, message });
    }
  },
);
module.exports = router;

/**
 * POST /api/testgen/submit — submit answers, release slot
 * Protected - Student only
 */
router.post("/submit", authMiddleware, rbac(["student"]), async (req, res) => {
  const sid = studentId(req);

  const { testId, questions, answers, timeTakenSeconds } = req.body;

  if (!testId || !questions || !answers) {
    return res.status(400).json({
      success: false,
      message: "testId, questions, and answers are required",
    });
  }

  try {
    const { data } = await axios.post(
      `${AGENT}/api/submit-answers`,
      {
        test_id: testId,
        student_id: sid,
        questions,
        answers,
        time_taken_seconds: timeTakenSeconds || 0,
      },
      { timeout: TIMEOUT_SUBMIT },
    );

    // ── Release concurrent slot ────────────────────────────────────────────
    testSessionManager.releaseSlot(sid);

    return res.json({ success: true, ...data });
  } catch (err) {
    // Release slot even on error
    testSessionManager.releaseSlot(sid);
    console.error(`[TestGen] submit failed for student ${sid}:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/testgen/ingest/lecture — trigger lecture ingestion
 * Protected - Admin/Faculty only
 */
router.post(
  "/ingest/lecture",
  authMiddleware,
  rbac(["admin", "faculty"]),
  async (req, res) => {
    if (!req.body.lectureId) {
      return res
        .status(400)
        .json({ success: false, message: "lectureId is required" });
    }
    try {
      const { data } = await axios.post(
        `${AGENT}/api/ingest/lecture`,
        { lecture_id: req.body.lectureId },
        { timeout: 10000 },
      );
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error("[TestGen] ingest/lecture failed:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

/**
 * POST /api/testgen/ingest/course — trigger course ingestion
 * Protected - Admin/Faculty only
 */
router.post(
  "/ingest/course",
  authMiddleware,
  rbac(["admin", "faculty"]),
  async (req, res) => {
    if (!req.body.courseId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId is required" });
    }
    try {
      const { data } = await axios.post(
        `${AGENT}/api/ingest/course`,
        { course_id: req.body.courseId },
        { timeout: 10000 },
      );
      return res.json({ success: true, ...data });
    } catch (err) {
      console.error("[TestGen] ingest/course failed:", err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

module.exports = router;
