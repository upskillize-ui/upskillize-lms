/**
 * testgen.js — Express router
 *
 * FIXES:
 * 1. releaseSlot() now called in ALL error paths (no more stuck sessions)
 * 2. Multi-college/multi-tenant slot isolation via collegeId
 * 3. Admin endpoint to force-clear a stuck session
 * 4. Better error messages for 429 vs slot-full
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
  console.warn("[TestGen] db module not found — enrollment check skipped");
  db = null;
}

function studentId(req) {
  return req.user ? String(req.user.id) : null;
}

// Extract college ID from user token or request body
// If your JWT includes college_id, use req.user.college_id
// Otherwise fall back to a hash of courseId as the isolation key
function getCollegeId(req) {
  if (req.user && req.user.college_id) return String(req.user.college_id);
  if (req.user && req.user.institute_id) return String(req.user.institute_id);
  // Fallback: use courseId prefix so different colleges' courses don't share limits
  const { courseId } = req.body || {};
  if (courseId) return `course_group_${String(courseId).substring(0, 8)}`;
  return null;
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
    return true; // fail open — don't block students on DB error
  }
}

// ── Health / Status ────────────────────────────────────────────────────────────

router.get("/health", async (req, res) => {
  try {
    const { data } = await axios.get(`${AGENT}/api/health`, { timeout: 5000 });
    const collegeId = req.query.college_id || null;
    const stats = await testSessionManager.getStats(collegeId);
    return res.json({
      success: true,
      agent: data,
      slots: stats,
      queueEnabled: !!testQueue,
    });
  } catch (err) {
    const stats = await testSessionManager.getStats();
    return res.status(503).json({
      success: false,
      message: "Agent unavailable",
      error: err.message,
      slots: stats,
      queueEnabled: !!testQueue,
    });
  }
});

router.get("/status", async (req, res) => {
  const collegeId = req.query.college_id || null;
  const stats = await testSessionManager.getStats(collegeId);
  res.json({ success: true, ...stats, queueEnabled: !!testQueue });
});

// ── Generate ───────────────────────────────────────────────────────────────────

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

    // ── Input validation ──────────────────────────────────────────────────────
    if (!topic || typeof topic !== "string" || !topic.trim())
      return res
        .status(400)
        .json({ success: false, message: "topic is required" });
    if (topic.trim().length > 200)
      return res.status(400).json({
        success: false,
        message: "topic must be under 200 characters",
      });
    if (!lectureId && !courseId)
      return res
        .status(400)
        .json({ success: false, message: "Provide lectureId or courseId" });

    // ── Rate limit check ──────────────────────────────────────────────────────
    const rl = testSessionManager.checkRateLimit(sid);
    if (rl.limited) {
      res.set("Retry-After", rl.retryAfterSeconds);
      return res.status(429).json({ success: false, message: rl.message });
    }

    // ── Enrollment check ──────────────────────────────────────────────────────
    const enrolled = await isEnrolled(sid, lectureId, courseId);
    if (!enrolled)
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });

    // ── Acquire slot (multi-college aware) ────────────────────────────────────
    const collegeId = getCollegeId(req);
    const slot = await testSessionManager.acquireSlot(sid, null, collegeId);
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
      // ✅ SUCCESS: Keep slot open — student is now taking the test
      return res.json({ success: true, ...data });
    } catch (err) {
      // ✅ BUGFIX: Always release slot on generation failure so student isn't stuck
      testSessionManager.releaseSlot(sid);
      const status = err.response?.status || 500;
      const message = err.response?.data?.detail || err.message;
      console.error(`[TestGen] generate failed for student ${sid}:`, message);
      return res.status(status).json({ success: false, message });
    }
  },
);

// ── Submit ─────────────────────────────────────────────────────────────────────

router.post("/submit", authMiddleware, rbac(["student"]), async (req, res) => {
  const sid = studentId(req);
  if (!sid)
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });

  const { testId, questions, answers, timeTakenSeconds } = req.body;
  if (!testId || !questions || !answers)
    return res.status(400).json({
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
    // ✅ Always release slot even on submit failure
    testSessionManager.releaseSlot(sid);
    console.error(`[TestGen] submit failed for student ${sid}:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Force-clear stuck session ──────────────────────────────────────────

router.post(
  "/admin/force-release/:studentId",
  authMiddleware,
  rbac(["admin"]),
  async (req, res) => {
    const targetId = req.params.studentId;
    await testSessionManager.forceRelease(targetId);
    res.json({
      success: true,
      message: `Session cleared for student ${targetId}`,
    });
  },
);

router.get(
  "/admin/sessions",
  authMiddleware,
  rbac(["admin"]),
  async (req, res) => {
    const sessions = testSessionManager.getDetailedSessions();
    const stats = await testSessionManager.getStats();
    res.json({ success: true, stats, sessions });
  },
);

// ── Ingest (Faculty/Admin) ─────────────────────────────────────────────────────

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

module.exports = router;
