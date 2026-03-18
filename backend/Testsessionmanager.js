/**
 * Testsessionmanager.js
 *
 * ✅ FIX 2: InstituteConfigManager wired in — per-college limits from DB, not env vars
 * ✅ FIX 3: Redis-backed sessions — survives server restarts, no stuck sessions
 * ✅ Multi-college/multi-tenant support
 * ✅ Per-student slot isolation (no cross-college blocking)
 * ✅ Global concurrency cap + per-college cap (configurable per institute)
 * ✅ Stuck session auto-recovery via Redis TTL
 * ✅ Per-student rate limiting
 */

const GLOBAL_MAX = parseInt(process.env.MAX_CONCURRENT_TESTS || "200");
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = parseInt(process.env.TESTGEN_RATE_LIMIT || "3");
const SESSION_TTL_MS = 90 * 60 * 1000; // 90 min max
const SESSION_TTL_SECONDS = Math.ceil(SESSION_TTL_MS / 1000); // for Redis TTL

// ── ✅ FIX 2: Load InstituteConfigManager for per-college limits ───────────────
let instituteConfig = null;
try {
  instituteConfig = require("./InstituteConfigManager");
  console.log(
    "[SessionMgr] ✅ InstituteConfigManager loaded — per-college limits active",
  );
} catch (e) {
  console.warn(
    "[SessionMgr] ⚠️  InstituteConfigManager not found — using env var defaults. Error:",
    e.message,
  );
}

// ── ✅ FIX 3: Redis client for persistent sessions ────────────────────────────
let redis = null;
try {
  redis = require("./redis"); // your existing redis.js from services/
  console.log(
    "[SessionMgr] ✅ Redis loaded — sessions will persist across restarts",
  );
} catch (e) {
  console.warn(
    "[SessionMgr] ⚠️  Redis not available — falling back to in-memory Map. Error:",
    e.message,
  );
}

// ── In-memory fallback (used when Redis unavailable) ──────────────────────────
// activeSessions: Map<studentId, { startedAt, expiresAt, testId, collegeId }>
const activeSessions = new Map();

// Rate buckets always in-memory (fast, ok to lose on restart)
// rateBuckets: Map<studentId, number[]>
const rateBuckets = new Map();

// Redis key helpers
const SESSION_KEY = (sid) => `test_session:${sid}`;
const COLLEGE_COUNT_KEY = (cid) => `test_college_count:${cid}`;
const GLOBAL_COUNT_KEY = "test_global_count";

// ── Redis helpers ─────────────────────────────────────────────────────────────

async function _redisGetSession(studentId) {
  if (!redis) return null;
  try {
    const raw = await redis.get(SESSION_KEY(studentId));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("[SessionMgr] Redis GET error:", e.message);
    return null;
  }
}

async function _redisSetSession(studentId, session) {
  if (!redis) {
    activeSessions.set(studentId, session);
    return;
  }
  try {
    await redis.set(
      SESSION_KEY(studentId),
      JSON.stringify(session),
      "EX",
      SESSION_TTL_SECONDS, // ✅ Redis auto-expires — no stuck sessions on restart
    );
    // Increment counters
    if (session.collegeId) {
      await redis.incr(COLLEGE_COUNT_KEY(session.collegeId));
      await redis.expire(
        COLLEGE_COUNT_KEY(session.collegeId),
        SESSION_TTL_SECONDS,
      );
    }
    await redis.incr(GLOBAL_COUNT_KEY);
  } catch (e) {
    console.error("[SessionMgr] Redis SET error:", e.message);
    // Fallback to memory
    activeSessions.set(studentId, session);
  }
}

async function _redisDeleteSession(studentId) {
  if (!redis) {
    const existed = activeSessions.has(studentId);
    activeSessions.delete(studentId);
    return existed;
  }
  try {
    const raw = await redis.get(SESSION_KEY(studentId));
    if (raw) {
      const session = JSON.parse(raw);
      await redis.del(SESSION_KEY(studentId));
      // Decrement counters
      if (session.collegeId) {
        await redis.decr(COLLEGE_COUNT_KEY(session.collegeId));
      }
      await redis.decr(GLOBAL_COUNT_KEY);
      return true;
    }
    return false;
  } catch (e) {
    console.error("[SessionMgr] Redis DEL error:", e.message);
    return false;
  }
}

async function _redisGlobalCount() {
  if (!redis) {
    _purgeExpired();
    return activeSessions.size;
  }
  try {
    const val = await redis.get(GLOBAL_COUNT_KEY);
    return Math.max(0, parseInt(val || "0"));
  } catch {
    return 0;
  }
}

async function _redisCollegeCount(collegeId) {
  if (!redis) return _activeCountForCollege(collegeId);
  try {
    const val = await redis.get(COLLEGE_COUNT_KEY(collegeId));
    return Math.max(0, parseInt(val || "0"));
  } catch {
    return 0;
  }
}

// ── In-memory fallback cleanup ─────────────────────────────────────────────────

function _purgeExpired() {
  if (redis) return; // Redis handles expiry via TTL
  const now = Date.now();
  let purged = 0;
  for (const [id, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) {
      activeSessions.delete(id);
      purged++;
    }
  }
  if (purged > 0) {
    console.log(
      `[SessionMgr] Purged ${purged} expired session(s). Active: ${activeSessions.size}`,
    );
  }
}

// Auto-cleanup every 5 min (only needed in memory fallback mode)
setInterval(_purgeExpired, 5 * 60 * 1000);

function _activeCountForCollege(collegeId) {
  if (!collegeId) return 0;
  let count = 0;
  for (const session of activeSessions.values()) {
    if (session.collegeId === String(collegeId)) count++;
  }
  return count;
}

// ── Rate limiting (always in-memory — fast) ───────────────────────────────────

function checkRateLimit(studentId) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const bucket = (rateBuckets.get(studentId) || []).filter(
    (t) => t > windowStart,
  );
  rateBuckets.set(studentId, bucket);

  const limit = RATE_LIMIT_MAX;

  if (bucket.length >= limit) {
    const oldest = bucket[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      limited: true,
      retryAfterSeconds: retryAfter,
      remaining: 0,
      message: `You can generate ${limit} tests per hour. Please wait ${Math.ceil(
        retryAfter / 60,
      )} minute(s).`,
    };
  }
  return {
    limited: false,
    retryAfterSeconds: 0,
    remaining: limit - bucket.length,
  };
}

function recordGeneration(studentId) {
  const bucket = rateBuckets.get(studentId) || [];
  bucket.push(Date.now());
  rateBuckets.set(studentId, bucket);
}

// ── Acquire slot ───────────────────────────────────────────────────────────────

/**
 * Acquire a test slot for a student.
 * Now async because Redis operations are async.
 *
 * @param {string} studentId
 * @param {string|null} testId
 * @param {string|null} collegeId — Pass college/institute ID for per-college limits
 */
async function acquireSlot(studentId, testId = null, collegeId = null) {
  // ── Check: student already has active session ──────────────────────────────
  const existing = await _redisGetSession(studentId);
  if (existing) {
    const timeLeft = Math.ceil((existing.expiresAt - Date.now()) / 60000);
    return {
      ok: false,
      reason: `You already have an active test in progress. Please submit or wait for it to expire (${Math.max(0, timeLeft)} min remaining).`,
      message: "Active test already exists for this student",
    };
  }

  // ── Check: global concurrency cap ─────────────────────────────────────────
  const globalCount = await _redisGlobalCount();
  if (globalCount >= GLOBAL_MAX) {
    return {
      ok: false,
      reason: `The system is at full capacity (${GLOBAL_MAX} students). Please try again in a few minutes.`,
      message: "Global test slots full",
    };
  }

  // ── ✅ FIX 2: Check per-college cap using InstituteConfigManager ───────────
  if (collegeId) {
    // Get the limit for this specific college from DB config (or global default)
    const perCollegeMax = instituteConfig
      ? instituteConfig.getConfig(collegeId).maxConcurrent
      : parseInt(process.env.MAX_CONCURRENT_PER_COLLEGE || "50");

    const collegeCount = await _redisCollegeCount(collegeId);

    if (collegeCount >= perCollegeMax) {
      return {
        ok: false,
        reason: `Your institute has reached its concurrent test limit (${perCollegeMax} students). Please try again shortly.`,
        message: "College test slots full",
      };
    }
  }

  // ── Acquire ────────────────────────────────────────────────────────────────
  const now = Date.now();
  const session = {
    startedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    testId,
    collegeId: collegeId ? String(collegeId) : null,
  };

  await _redisSetSession(studentId, session);

  const currentGlobal = await _redisGlobalCount();
  console.log(
    `[SessionMgr] Slot acquired: student=${studentId} college=${collegeId || "none"} ` +
      `Global: ${currentGlobal}/${GLOBAL_MAX}`,
  );

  return { ok: true, message: "Slot acquired successfully" };
}

// ── Release slot ───────────────────────────────────────────────────────────────

async function releaseSlot(studentId) {
  const existed = await _redisDeleteSession(studentId);
  if (existed) {
    const currentGlobal = await _redisGlobalCount();
    console.log(
      `[SessionMgr] Slot released: student=${studentId}. Active: ${currentGlobal}/${GLOBAL_MAX}`,
    );
  }
  return {
    ok: existed,
    message: existed ? "Slot released" : "No active slot found",
  };
}

// ── Force release (admin) ──────────────────────────────────────────────────────

async function forceRelease(studentId) {
  await _redisDeleteSession(studentId);
  console.warn(`[SessionMgr] Force-released session for student=${studentId}`);
  return { ok: true };
}

// ── Stats ──────────────────────────────────────────────────────────────────────

async function getStats(collegeId = null) {
  const activeCount = await _redisGlobalCount();

  const result = {
    activeTestTakers: activeCount,
    maxConcurrent: GLOBAL_MAX,
    availableSlots: Math.max(0, GLOBAL_MAX - activeCount),
    occupancyPercent: Math.round((activeCount / GLOBAL_MAX) * 100),
    timestamp: new Date().toISOString(),
    redisEnabled: !!redis,
  };

  if (collegeId) {
    const perCollegeMax = instituteConfig
      ? instituteConfig.getConfig(collegeId).maxConcurrent
      : parseInt(process.env.MAX_CONCURRENT_PER_COLLEGE || "50");

    const collegeCount = await _redisCollegeCount(collegeId);
    result.collegeActiveTestTakers = collegeCount;
    result.collegeMaxConcurrent = perCollegeMax;
    result.collegeAvailableSlots = Math.max(0, perCollegeMax - collegeCount);
  }

  return result;
}

async function hasActiveSession(studentId) {
  const session = await _redisGetSession(studentId);
  return !!session;
}

function getActiveSessions() {
  // In-memory fallback only — Redis doesn't expose all keys easily
  _purgeExpired();
  return Array.from(activeSessions.keys());
}

function getDetailedSessions() {
  // In-memory fallback only
  _purgeExpired();
  return Array.from(activeSessions.entries()).map(([studentId, session]) => ({
    studentId,
    testId: session.testId || null,
    collegeId: session.collegeId || null,
    startedAt: new Date(session.startedAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
    durationMs: Date.now() - session.startedAt,
  }));
}

async function resetAll() {
  if (redis) {
    try {
      // Only clear test session keys, not all Redis data
      const keys = await redis.keys("test_session:*");
      const countKeys = await redis.keys("test_college_count:*");
      const allKeys = [...keys, ...countKeys, GLOBAL_COUNT_KEY];
      if (allKeys.length > 0) await redis.del(...allKeys);
    } catch (e) {
      console.error("[SessionMgr] Redis resetAll error:", e.message);
    }
  }
  activeSessions.clear();
  rateBuckets.clear();
  console.warn("[SessionMgr] ⚠️  All sessions reset!");
}

module.exports = {
  checkRateLimit,
  recordGeneration,
  acquireSlot, // now async
  releaseSlot, // now async
  forceRelease, // now async
  getStats, // now async
  hasActiveSession, // now async
  getActiveSessions,
  getDetailedSessions,
  resetAll, // now async
};
