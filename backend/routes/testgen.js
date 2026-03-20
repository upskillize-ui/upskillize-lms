/**
 * testgen.js — Express router
 *
 * ✅ FIX 1: BullMQ queue for AI generation (stops 429)
 * ✅ FIX 2: Sequelize query for enrollment check
 * ✅ FIX 3: releaseSlot() called in ALL error paths
 * ✅ FIX 4: await on all async session manager calls
 * ✅ Multi-college/multi-tenant slot isolation
 */

const express = require("express");
const router = express.Router();
const axios = require("axios");
const testSessionManager = require("../Testsessionmanager");
const authMiddleware = require("../middleware/auth");
const rbac = require("../middleware/rbac");

// ✅ FIX 1: Load BullMQ queue
let testQueue = null;
let queueEvents = null;
try {
  const queueModule = require("../services/testQueue");
  testQueue = queueModule.testQueue;
  queueEvents = queueModule.queueEvents;
  console.log(
    "[TestGen] ✅ BullMQ queue loaded — concurrent AI calls protected",
  );
} catch (e) {
  console.warn(
    "[TestGen] ⚠️ testQueue not available — direct axios fallback. Error:",
    e.message,
  );
}

const AGENT =
  process.env.MOCK_TEST_AGENT_URL || "https://upskill25-myagent.hf.space";
const TIMEOUT_GENERATE = 90_000;
const TIMEOUT_SUBMIT = 30_000;

// ✅ FIX 2: Use sequelize from db module
let sequelize = null;
try {
  const db = require("../config/database");
  sequelize = db.sequelize || db;
} catch {
  console.warn("[TestGen] db module not found — enrollment check skipped");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function studentId(req) {
  return req.user ? String(req.user.id) : null;
}

function getCollegeId(req) {
  if (req.user && req.user.college_id) return String(req.user.college_id);
  if (req.user && req.user.institute_id) return String(req.user.institute_id);
  const { courseId } = req.body || {};
  if (courseId) return `course_group_${String(courseId).substring(0, 8)}`;
  return null;
}

// ✅ FIX 2: Sequelize-compatible enrollment check
async function isEnrolled(userId, lectureId, courseId) {
  if (!sequelize) return true;
  try {
    // Step 1: Get the student.id from users.id (they are different!)
    const [studentRows] = await sequelize.query(
      `SELECT id FROM students WHERE user_id = :userId LIMIT 1`,
      { replacements: { userId }, type: 'SELECT' }
    );
    
    const studentId = studentRows?.id ?? studentRows?.[0]?.id;
    if (!studentId) {
      console.log(`[TestGen] No student record found for user_id=${userId}`);
      return true; // fail open if no student record
    }

    // Step 2: Check enrollment using the correct student_id
    const [results] = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM enrollments WHERE student_id = :studentId AND course_id = :courseId`,
      { replacements: { studentId, courseId: courseId || 0 }, type: 'SELECT' }
    );

    const count = results?.cnt ?? results?.[0]?.cnt ?? 0;
    console.log(`[TestGen] Enrollment: user=${userId} → student=${studentId}, course=${courseId}, enrolled=${count > 0}`);
    return parseInt(count) > 0;
  } catch (err) {
    console.error("[TestGen] Enrollment check failed:", err.message);
    return true; // fail open
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

    // Rate limit check
    const rl = testSessionManager.checkRateLimit(sid);
    if (rl.limited) {
      res.set("Retry-After", rl.retryAfterSeconds);
      return res.status(429).json({ success: false, message: rl.message });
    }

    // Enrollment check
    const enrolled = await isEnrolled(sid, lectureId, courseId);
    if (!enrolled)
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });

    // ✅ FIX 4: await acquireSlot
    const collegeId = getCollegeId(req);
    const slot = await testSessionManager.acquireSlot(sid, null, collegeId);
    if (!slot.ok)
      return res.status(429).json({ success: false, message: slot.reason });

    testSessionManager.recordGeneration(sid);

    const agentPayload = {
      topic: topic.trim(),
      lecture_id: lectureId || null,
      course_id: courseId || null,
      num_questions: Math.min(Math.max(numQuestions || 10, 1), 50),
      duration_minutes: Math.min(Math.max(durationMinutes || 30, 1), 180),
      difficulty: ["easy", "medium", "hard", "complex"].includes(difficulty)
        ? difficulty
        : "medium",
      question_types:
        Array.isArray(questionTypes) && questionTypes.length
          ? questionTypes
          : ["mcq"],
      student_id: sid,
    };

    try {
      let responseData;

      if (testQueue && queueEvents) {
        // QUEUED PATH — safe for 100s of concurrent students
        console.log(
          `[TestGen] Queuing job for student=${sid} college=${collegeId || "none"}`,
        );
        const job = await testQueue.add("generate", agentPayload, {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          jobId: `gen_${sid}_${Date.now()}`,
        });
        responseData = await job.waitUntilFinished(
          queueEvents,
          TIMEOUT_GENERATE,
        );
        console.log(`[TestGen] ✅ Job done: student=${sid} job=${job.id}`);
      } else {
        // DIRECT PATH — fallback if Redis unavailable
        console.log(`[TestGen] Direct AI call for student=${sid}`);
        const { data } = await axios.post(
          `${AGENT}/api/generate-test`,
          agentPayload,
          { timeout: TIMEOUT_GENERATE },
        );
        responseData = data;
      }

      return res.json({ success: true, ...responseData });
    } catch (err) {
      // ✅ FIX 3: ALWAYS release slot on failure
      await testSessionManager.releaseSlot(sid);
      const status = err.response?.status || 500;
      const message =
        err.response?.data?.detail || err.message || "Unknown error";
      console.error(`[TestGen] generate FAILED for student=${sid}:`, message);

      if (
        message.includes("timeout") ||
        message.includes("waiting") ||
        message.includes("timed out")
      ) {
        return res.status(503).json({
          success: false,
          message: "Test generation timed out. Please try again.",
        });
      }
      return res
        .status(status >= 400 && status < 600 ? status : 500)
        .json({ success: false, message });
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
    // ✅ FIX: Transform answers from frontend format to agent format
    // Frontend sends: { 0: "B", 1: ["A","C"], 2: "A" }  (index-based, strings or arrays)
    // Agent expects:  { "q1": ["B"], "q2": ["A","C"], "q3": ["A"] }  (id-based, always arrays)
    const transformedAnswers = {};
    for (const [key, value] of Object.entries(answers)) {
      // Determine the question ID
      const qIndex = parseInt(key);
      const questionId =
        !isNaN(qIndex) && questions[qIndex]
          ? questions[qIndex].id || `q${qIndex + 1}`
          : key; // If key is already a question ID like "q1", use as-is

      // Ensure value is always an array
      if (Array.isArray(value)) {
        transformedAnswers[questionId] = value;
      } else if (value !== null && value !== undefined && value !== "") {
        transformedAnswers[questionId] = [String(value)];
      } else {
        transformedAnswers[questionId] = [];
      }
    }

    console.log(
      `[TestGen] Submit: student=${sid}, answers transformed:`,
      Object.keys(transformedAnswers).length,
      "questions answered",
    );

    const { data } = await axios.post(
      `${AGENT}/api/submit-answers`,
      {
        test_id: testId,
        student_id: sid,
        questions,
        answers: transformedAnswers,
        time_taken_seconds: timeTakenSeconds || 0,
      },
      { timeout: TIMEOUT_SUBMIT },
    );
    await testSessionManager.releaseSlot(sid);
    return res.json({ success: true, ...data });
  } catch (err) {
    await testSessionManager.releaseSlot(sid);
    console.error(
      `[TestGen] submit FAILED for student=${sid}:`,
      err.response?.data || err.message,
    );
    return res
      .status(500)
      .json({
        success: false,
        message: err.response?.data?.detail || err.message,
      });
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

router.post(
  "/admin/reset-all",
  authMiddleware,
  rbac(["admin"]),
  async (req, res) => {
    await testSessionManager.resetAll();
    res.json({ success: true, message: "⚠️ All sessions have been reset." });
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
