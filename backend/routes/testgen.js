/**
 * testgen.js — Express router
 * Connects React frontend ↔ RAG FastAPI agent
 *
 * CRITICAL BUG FIX: module.exports was placed in the MIDDLE of the original file.
 * This meant /submit, /ingest/lecture, /ingest/course were NEVER registered.
 * Fixed: module.exports is now at the very end.
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const testSessionManager = require("../Testsessionmanager");

const authMiddleware = require("../middleware/auth");
const rbac = require("../middleware/rbac");

const AGENT =
  process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space";
const TIMEOUT_GENERATE = 90_000;
const TIMEOUT_SUBMIT = 30_000;

let db;
try {
  db = require("../config/database");
} catch {
  console.warn(
    "[TestGen] db module not found — enrollment check will be skipped",
  );
  db = null;
}

function studentId(req) {
  return req.user ? String(req.user.id) : null;
}

async function isEnrolled(userId, lectureId, courseId) {
  if (!db) return true;
  try {
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
    return true;
  }
}

router.get("/health", async (req, res) => {
  try {
    const { data } = await axios.get(`${AGENT}/api/health`, { timeout: 5000 });
    const stats = testSessionManager.getStats();
    return res.json({ success: true, agent: data, slots: stats });
  } catch (err) {
    const stats = testSessionManager.getStats();
    return res
      .status(503)
      .json({
        success: false,
        message: "Agent unavailable",
        error: err.message,
        slots: stats,
      });
  }
});

router.get("/status", (req, res) => {
  const stats = testSessionManager.getStats();
  res.json({
    success: true,
    activeCount: stats.activeTestTakers,
    maxAllowed: stats.maxConcurrent,
    availableSlots: stats.availableSlots,
    occupancyPercent: stats.occupancyPercent,
    timestamp: stats.timestamp,
    activeTestTakers: stats.activeTestTakers,
    maxConcurrent: stats.maxConcurrent,
  });
});

router.post(
  "/generate",
  authMiddleware,
  rbac(["student"]),
  async (req, res) => {
    const sid = studentId(req);
    if (!sid)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });

    const {
      lectureId,
      courseId,
      topic,
      numQuestions,
      durationMinutes,
      difficulty,
      questionTypes,
    } = req.body;

    if (!topic || typeof topic !== "string" || !topic.trim())
      return res
        .status(400)
        .json({ success: false, message: "topic is required" });
    if (topic.trim().length > 200)
      return res
        .status(400)
        .json({
          success: false,
          message: "topic must be under 200 characters",
        });
    if (!lectureId && !courseId)
      return res
        .status(400)
        .json({ success: false, message: "Provide lectureId or courseId" });

    const rl = testSessionManager.checkRateLimit(sid);
    if (rl.limited) {
      res.set("Retry-After", rl.retryAfterSeconds);
      return res.status(429).json({ success: false, message: rl.message });
    }

    const enrolled = await isEnrolled(sid, lectureId, courseId);
    if (!enrolled)
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not enrolled in this course.",
        });

    const slot = testSessionManager.acquireSlot(sid);
    if (!slot.ok)
      return res.status(429).json({ success: false, message: slot.reason });

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
      return res.json({ success: true, ...data });
    } catch (err) {
      testSessionManager.releaseSlot(sid);
      const status = err.response?.status || 500;
      const message = err.response?.data?.detail || err.message;
      console.error(`[TestGen] generate failed for student ${sid}:`, message);
      return res.status(status).json({ success: false, message });
    }
  },
);

router.post("/submit", authMiddleware, rbac(["student"]), async (req, res) => {
  const sid = studentId(req);
  if (!sid)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });

  const { testId, questions, answers, timeTakenSeconds } = req.body;
  if (!testId || !questions || !answers)
    return res
      .status(400)
      .json({
        success: false,
        message: "testId, questions, and answers are required",
      });

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
    testSessionManager.releaseSlot(sid);
    return res.json({ success: true, ...data });
  } catch (err) {
    testSessionManager.releaseSlot(sid);
    console.error(`[TestGen] submit failed for student ${sid}:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  "/ingest/lecture",
  authMiddleware,
  rbac(["admin", "faculty"]),
  async (req, res) => {
    if (!req.body.lectureId)
      return res
        .status(400)
        .json({ success: false, message: "lectureId is required" });
    try {
      const { data } = await axios.post(
        `${AGENT}/api/ingest/lecture`,
        { lecture_id: req.body.lectureId },
        { timeout: 10000 },
      );
      return res.json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

router.post(
  "/ingest/course",
  authMiddleware,
  rbac(["admin", "faculty"]),
  async (req, res) => {
    if (!req.body.courseId)
      return res
        .status(400)
        .json({ success: false, message: "courseId is required" });
    try {
      const { data } = await axios.post(
        `${AGENT}/api/ingest/course`,
        { course_id: req.body.courseId },
        { timeout: 10000 },
      );
      return res.json({ success: true, ...data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
);

// ✅ MUST be at the END — not in the middle of the file
module.exports = router;
