/**
 * Testsessionmanager.js
 *
 * ✅ Multi-college/multi-tenant support
 * ✅ Per-student slot isolation (no cross-college blocking)
 * ✅ Global concurrency cap + per-college cap
 * ✅ Stuck session auto-recovery
 * ✅ Per-student rate limiting
 */

const GLOBAL_MAX = parseInt(process.env.MAX_CONCURRENT_TESTS || "200");
const PER_COLLEGE_MAX = parseInt(
  process.env.MAX_CONCURRENT_PER_COLLEGE || "50",
);
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = parseInt(process.env.TESTGEN_RATE_LIMIT || "3");
const SESSION_TTL_MS = 90 * 60 * 1000; // 90 min max

/**
 * activeSessions: Map<studentId, { startedAt, expiresAt, testId, collegeId }>
 * rateBuckets:    Map<studentId, number[]>
 */
const activeSessions = new Map();
const rateBuckets = new Map();

// ── Cleanup ────────────────────────────────────────────────────────────────────

function _purgeExpired() {
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

// Auto-cleanup every 5 minutes
setInterval(_purgeExpired, 5 * 60 * 1000);

// ── Helpers ────────────────────────────────────────────────────────────────────

function _activeCountForCollege(collegeId) {
  if (!collegeId) return 0;
  let count = 0;
  for (const session of activeSessions.values()) {
    if (session.collegeId === String(collegeId)) count++;
  }
  return count;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Check if a student is rate-limited.
 */
function checkRateLimit(studentId) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const bucket = (rateBuckets.get(studentId) || []).filter(
    (t) => t > windowStart,
  );
  rateBuckets.set(studentId, bucket);

  if (bucket.length >= RATE_LIMIT_MAX) {
    const oldest = bucket[0];
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      limited: true,
      retryAfterSeconds: retryAfter,
      remaining: 0,
      message: `You can generate ${RATE_LIMIT_MAX} tests per hour. Please wait ${Math.ceil(retryAfter / 60)} minute(s).`,
    };
  }
  return {
    limited: false,
    retryAfterSeconds: 0,
    remaining: RATE_LIMIT_MAX - bucket.length,
  };
}

/**
 * Record a test generation for rate limiting.
 */
function recordGeneration(studentId) {
  const bucket = rateBuckets.get(studentId) || [];
  bucket.push(Date.now());
  rateBuckets.set(studentId, bucket);
}

/**
 * Acquire a test slot for a student.
 * @param {string} studentId
 * @param {string|null} testId
 * @param {string|null} collegeId  — Pass college/institute ID for per-college limits
 */
function acquireSlot(studentId, testId = null, collegeId = null) {
  _purgeExpired();

  // ── Check: student already has active session ──────────────────────────────
  if (activeSessions.has(studentId)) {
    const existing = activeSessions.get(studentId);
    const timeLeft = Math.ceil((existing.expiresAt - Date.now()) / 60000);
    return {
      ok: false,
      reason: `You already have an active test in progress. Please submit or wait for it to expire (${timeLeft} min remaining).`,
      message: "Active test already exists for this student",
    };
  }

  // ── Check: global concurrency cap ─────────────────────────────────────────
  if (activeSessions.size >= GLOBAL_MAX) {
    return {
      ok: false,
      reason: `The system is at full capacity (${GLOBAL_MAX} students). Please try again in a few minutes.`,
      message: "Global test slots full",
    };
  }

  // ── Check: per-college concurrency cap ────────────────────────────────────
  if (collegeId) {
    const collegeCount = _activeCountForCollege(collegeId);
    if (collegeCount >= PER_COLLEGE_MAX) {
      return {
        ok: false,
        reason: `Your institute has reached its concurrent test limit (${PER_COLLEGE_MAX} students). Please try again shortly.`,
        message: "College test slots full",
      };
    }
  }

  // ── Acquire ────────────────────────────────────────────────────────────────
  const now = Date.now();
  activeSessions.set(studentId, {
    startedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    testId,
    collegeId: collegeId ? String(collegeId) : null,
  });

  console.log(
    `[SessionMgr] Slot acquired: student=${studentId} college=${collegeId || "none"} ` +
      `Global: ${activeSessions.size}/${GLOBAL_MAX}`,
  );

  return { ok: true, message: "Slot acquired successfully" };
}

/**
 * Release a student's test slot.
 */
function releaseSlot(studentId) {
  const existed = activeSessions.has(studentId);
  activeSessions.delete(studentId);
  if (existed) {
    console.log(
      `[SessionMgr] Slot released: student=${studentId}. Active: ${activeSessions.size}/${GLOBAL_MAX}`,
    );
  }
  return {
    ok: existed,
    message: existed ? "Slot released" : "No active slot found",
  };
}

/**
 * Force-clear a stuck session (admin use).
 */
function forceRelease(studentId) {
  activeSessions.delete(studentId);
  console.warn(`[SessionMgr] Force-released session for student=${studentId}`);
  return { ok: true };
}

/**
 * Get occupancy stats.
 */
function getStats(collegeId = null) {
  _purgeExpired();
  const activeCount = activeSessions.size;

  const result = {
    activeTestTakers: activeCount,
    maxConcurrent: GLOBAL_MAX,
    availableSlots: GLOBAL_MAX - activeCount,
    occupancyPercent: Math.round((activeCount / GLOBAL_MAX) * 100),
    timestamp: new Date().toISOString(),
  };

  if (collegeId) {
    const collegeCount = _activeCountForCollege(collegeId);
    result.collegeActiveTestTakers = collegeCount;
    result.collegeMaxConcurrent = PER_COLLEGE_MAX;
    result.collegeAvailableSlots = PER_COLLEGE_MAX - collegeCount;
  }

  return result;
}

function hasActiveSession(studentId) {
  _purgeExpired();
  return activeSessions.has(studentId);
}

function getActiveSessions() {
  _purgeExpired();
  return Array.from(activeSessions.keys());
}

function getDetailedSessions() {
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

function resetAll() {
  activeSessions.clear();
  rateBuckets.clear();
  console.warn("[SessionMgr] ⚠️  All sessions reset!");
}

module.exports = {
  checkRateLimit,
  recordGeneration,
  acquireSlot,
  releaseSlot,
  forceRelease,
  getStats,
  hasActiveSession,
  getActiveSessions,
  getDetailedSessions,
  resetAll,
};
