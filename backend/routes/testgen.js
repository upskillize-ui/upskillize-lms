/**
 * testgen.js — Express router
 *
 * ✅ FIX 1: BullMQ queue used for AI generation (stops 429 from concurrent direct calls)
 * ✅ FIX 2: InstituteConfigManager wired in via Testsessionmanager
 * ✅ FIX 3: releaseSlot() called in ALL error paths (no more stuck sessions)
 * ✅ Multi-college/multi-tenant slot isolation via collegeId
 * ✅ Admin endpoints: force-release, view sessions, reset-all
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const testSessionManager = require("../Testsessionmanager");
const authMiddleware = require("../middleware/auth");
const rbac = require("../middleware/rbac");

// ✅ FIX 1: Load BullMQ queue — AI calls go through queue, not direct axios
let testQueue = null;
let queueEvents = null;
try {
  const queueModule = require("../services/testQueue");
  testQueue = queueModule.testQueue;
  queueEvents = queueModule.queueEvents; // QueueEvents instance for waitUntilFinished
  console.log(
    "[TestGen] ✅ BullMQ queue loaded — concurrent AI calls protected",
  );
} catch (e) {
  console.warn(
    "[TestGen] ⚠️  testQueue not available — falling back to direct axios. Error:",
    e.message,
  );
}

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function studentId(req) {
  return req.user ? String(req.user.id) : null;
}

// Extract college/institute ID from JWT claims or request body
function getCollegeId(req) {
  if (req.user && req.user.college_id) return String(req.user.college_id);
  if (req.user && req.user.institute_id) return String(req.user.institute_id);
  // Fallback: scope by courseId prefix so colleges don't share limits
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
    return true; // fail open — never block a student due to DB error
  }
}

// ── Health / Status ────────────────────────────────────────────────────────────

router.get("/health", async (req, res) => {
  try {
    const { data } = await axios.get(`${AGENT}/api/health`, { timeout: 5000 });
    const collegeId = req.query.college_id || null;
    const stats = testSessionManager.getStats(collegeId);
    return res.json({
      success: true,
      agent: data,
      slots: stats,
      queueEnabled: !!testQueue,
    });
  } catch (err) {
    const stats = testSessionManager.getStats();
    return res.status(503).json({
      success: false,
      message: "Agent unavailable",
      error: err.message,
      slots: stats,
      queueEnabled: !!testQueue,
    });
  }
});

router.get("/status", (req, res) => {
  const collegeId = req.query.college_id || null;
  const stats = testSessionManager.getStats(collegeId);
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

    // ── Rate limit check (per-student, per-hour) ──────────────────────────────
    const rl = testSessionManager.checkRateLimit(sid);
    if (rl.limited) {
      res.set("Retry-After", rl.retryAfterSeconds);
      return res.status(429).json({ success: false, message: rl.message });
    }

    // ── Enrollment check ──────────────────────────────────────────────────────
    const enrolled = await isEnrolled(sid, lectureId, courseId);
    if (!enrolled)
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not enrolled in this course.",
        });

    // ── Acquire slot ──────────────────────────────────────────────────────────
    // ✅ FIX 2: Testsessionmanager now uses InstituteConfigManager internally
    // so per-college limits are read from DB config, not hardcoded env vars
    const collegeId = getCollegeId(req);
    const slot = testSessionManager.acquireSlot(sid, null, collegeId);
    if (!slot.ok)
      return res.status(429).json({ success: false, message: slot.reason });

    // Record this generation attempt for per-student rate limiting
    testSessionManager.recordGeneration(sid);

    // ── Build AI agent payload ────────────────────────────────────────────────
    const agentPayload = {
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
    };

    // ── ✅ FIX 1: Route through BullMQ queue (rate-limited, retryable) ─────────
    try {
      let responseData;

      if (testQueue && queueEvents) {
        // QUEUED PATH — handles 100s of simultaneous students safely
        // BullMQ limits concurrency to 20 (set in testQueue.js worker)
        // so the AI agent never gets more than 20 simultaneous requests
        console.log(
          `[TestGen] Queuing job for student=${sid} college=${collegeId || "none"}`,
        );

        const job = await testQueue.add("generate", agentPayload, {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          jobId: `gen_${sid}_${Date.now()}`,
        });

        // Block until this job finishes (or times out after 90s)
        responseData = await job.waitUntilFinished(
          queueEvents,
          TIMEOUT_GENERATE,
        );

        console.log(`[TestGen] ✅ Job done: student=${sid} job=${job.id}`);
      } else {
        // DIRECT PATH — fallback if Redis/BullMQ unavailable (e.g. local dev)
        console.log(
          `[TestGen] Direct AI call for student=${sid} (queue unavailable)`,
        );
        const { data } = await axios.post(
          `${AGENT}/api/generate-test`,
          agentPayload,
          { timeout: TIMEOUT_GENERATE },
        );
        responseData = data;
      }

      // ✅ SUCCESS — slot stays open, student is now actively taking the test
      return res.json({ success: true, ...responseData });
    } catch (err) {
      // ✅ FIX 3: ALWAYS release slot on ANY failure — student must not get stuck
      testSessionManager.releaseSlot(sid);

      const status = err.response?.status || 500;
      const message =
        err.response?.data?.detail || err.message || "Unknown error";
      console.error(`[TestGen] generate FAILED for student=${sid}:`, message);

      // Friendly timeout message
      if (
        message.includes("timeout") ||
        message.includes("waiting") ||
        message.includes("timed out")
      ) {
        return res.status(503).json({
          success: false,
          message:
            "Test generation is taking longer than expected. Please try again in a moment.",
        });
      }

      return res.status(status >= 400 && status < 600 ? status : 500).json({
        success: false,
        message,
      });
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

    // ✅ Release slot after successful submit
    testSessionManager.releaseSlot(sid);
    return res.json({ success: true, ...data });
  } catch (err) {
    // ✅ Always release on submit failure too — student attempted to submit
    testSessionManager.releaseSlot(sid);
    console.error(`[TestGen] submit FAILED for student=${sid}:`, err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: Force-clear a stuck session ────────────────────────────────────────

router.post(
  "/admin/force-release/:studentId",
  authMiddleware,
  rbac(["admin"]),
  (req, res) => {
    const targetId = req.params.studentId;
    testSessionManager.forceRelease(targetId);
    res.json({
      success: true,
      message: `Session cleared for student ${targetId}`,
    });
  },
);

// ── Admin: View all active sessions ───────────────────────────────────────────

router.get("/admin/sessions", authMiddleware, rbac(["admin"]), (req, res) => {
  const sessions = testSessionManager.getDetailedSessions();
  const stats = testSessionManager.getStats();
  res.json({ success: true, stats, sessions });
});

// ── Admin: Emergency reset of all sessions ────────────────────────────────────

router.post("/admin/reset-all", authMiddleware, rbac(["admin"]), (req, res) => {
  testSessionManager.resetAll();
  res.json({
    success: true,
    message: "⚠️ All sessions have been reset.",
  });
});

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
