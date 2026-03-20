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
  if (!sequelize) return true; // fail open if no DB
  try {
    const query = courseId
      ? `SELECT COUNT(*) as cnt FROM enrollments WHERE student_id = :userId AND course_id = :courseId`
      : `SELECT COUNT(*) as cnt FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         JOIN course_modules cm ON cm.course_id = c.id
         JOIN lessons l ON l.course_module_id = cm.id
         WHERE e.student_id = :userId AND l.id = :lectureId`;

    const [results] = await sequelize.query(query, {
      replacements: courseId ? { userId, courseId } : { userId, lectureId },
      type: sequelize.QueryTypes?.SELECT || "SELECT",
    });

    const count = results?.cnt ?? results?.[0]?.cnt ?? 0;
    return parseInt(count) > 0;
  } catch (err) {
    console.error("[TestGen] Enrollment check failed:", err.message);
    return true; // fail open — never block students on DB error
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
    // Frontend sends: { 0: "Option text here", 1: ["Text A","Text C"] }  (index-based, option TEXT)
    // Agent expects:  { "q1": ["B"], "q2": ["A","C"] }  (id-based, option LETTERS)
    // We need to reverse-lookup: find which letter key matches the selected text
    const transformedAnswers = {};
    for (const [key, value] of Object.entries(answers)) {
      const qIndex = parseInt(key);
      const question = !isNaN(qIndex) ? questions[qIndex] : null;
      const questionId = question ? (question.id || `q${qIndex + 1}`) : key;

      // Get the options map for this question (e.g., {A: "text1", B: "text2", ...})
      const options = question?.options || {};

      // Helper: convert option text to its letter key
      const textToLetter = (text) => {
        if (!text || typeof text !== 'string') return text;
        // If it's already a single letter (A, B, C, D, E), keep it
        if (/^[A-E]$/.test(text.trim())) return text.trim();
        // If it's "True"/"False" for true_false questions, map to letter
        if (text.trim() === 'True') return 'A';
        if (text.trim() === 'False') return 'B';
        // Reverse lookup: find which letter has this text as its value
        for (const [letter, optionText] of Object.entries(options)) {
          if (optionText === text || optionText.trim() === text.trim()) {
            return letter;
          }
        }
        // No match found — return original (agent will handle mismatch)
        return text;
      };

      // Convert value(s) to letter(s)
      if (Array.isArray(value)) {
        transformedAnswers[questionId] = value.map(textToLetter);
      } else if (value !== null && value !== undefined && value !== "") {
        transformedAnswers[questionId] = [textToLetter(String(value))];
      } else {
        transformedAnswers[questionId] = [];
      }
    }

    console.log(`[TestGen] Submit: student=${sid}, answers transformed:`, 
      Object.keys(transformedAnswers).length, "questions answered",
      JSON.stringify(transformedAnswers));

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
    console.error(`[TestGen] submit FAILED for student=${sid}:`, err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.response?.data?.detail || err.message });
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
