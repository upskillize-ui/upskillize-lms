/**
 * testSessionManager.js
 * In-memory session control for <100 concurrent students.
 * No Redis. No BullMQ. Works perfectly on Railway / Render.
 *
 * Controls:
 *  - Max concurrent test-takers (configurable via MAX_CONCURRENT_TESTS env)
 *  - One active test per student at a time
 *  - Institute-level enrollment validation
 *  - Per-student rate limiting on test generation
 */

const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_TESTS || "50");
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = parseInt(process.env.TESTGEN_RATE_LIMIT || "3"); // 3 generates/hour/student
const SESSION_TTL_MS = 90 * 60 * 1000; // 90 min max test duration

// active sessions: Map<studentId, { startedAt: Date, expiresAt: Date }>
const activeSessions = new Map();

// rate limit buckets: Map<studentId, number[]> (timestamps of recent requests)
const rateBuckets = new Map();

// ── Cleanup Interval ───────────────────────────────────────────────────────────
/**
 * Purge sessions that expired (no explicit submit)
 */
function _purgeExpired() {
  const now = Date.now();
  let purgedCount = 0;

  for (const [id, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) {
      activeSessions.delete(id);
      purgedCount++;
    }
  }

  if (purgedCount > 0) {
    console.log(
      "[testSessionManager] Purged " + purgedCount + " expired session(s)",
    );
  }
}

/**
 * Auto-cleanup: Run every 5 minutes
 */
function _startAutoCleanup() {
  setInterval(
    () => {
      _purgeExpired();
    },
    5 * 60 * 1000,
  );
}

// Start cleanup on module load
_startAutoCleanup();

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Check if a student is rate-limited for test generation.
 *
 * @param {string} studentId - Student ID
 * @returns {Object} { limited: bool, retryAfterSeconds: number, remaining: number }
 */
function checkRateLimit(studentId) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Filter bucket to only requests within the window
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
    message: "Rate limit OK",
  };
}

/**
 * Record a test generation attempt for rate limiting
 *
 * @param {string} studentId - Student ID
 */
function recordGeneration(studentId) {
  const bucket = rateBuckets.get(studentId) || [];
  bucket.push(Date.now());
  rateBuckets.set(studentId, bucket);
}

/**
 * Attempt to acquire a test slot for a student.
 *
 * @param {string} studentId - Student ID
 * @param {string} testId - Optional test ID for tracking
 * @returns {Object} { ok: bool, reason?: string, message?: string }
 */
function acquireSlot(studentId, testId = null) {
  _purgeExpired();

  if (activeSessions.has(studentId)) {
    return {
      ok: false,
      reason:
        "You already have an active test in progress. Please submit or wait for it to expire.",
      message: "Active test already exists for this student",
    };
  }

  if (activeSessions.size >= MAX_CONCURRENT) {
    return {
      ok: false,
      reason: `All ${MAX_CONCURRENT} test slots are currently occupied. Please try again in a few minutes.`,
      message: "All test slots full",
    };
  }

  const now = Date.now();
  activeSessions.set(studentId, {
    startedAt: now,
    expiresAt: now + SESSION_TTL_MS,
    testId: testId,
  });

  console.log(
    `[testSessionManager] Slot acquired for student ${studentId}. Active: ${activeSessions.size}/${MAX_CONCURRENT}`,
  );

  return { ok: true, message: "Slot acquired successfully" };
}

/**
 * Release a student's test slot (call on submit or timeout).
 *
 * @param {string} studentId - Student ID
 * @returns {Object} { ok: bool, message: string }
 */
function releaseSlot(studentId) {
  const existed = activeSessions.has(studentId);
  activeSessions.delete(studentId);

  if (existed) {
    console.log(
      `[testSessionManager] Slot released for student ${studentId}. Active: ${activeSessions.size}/${MAX_CONCURRENT}`,
    );
  }

  return {
    ok: existed,
    message: existed ? "Slot released successfully" : "No active slot found",
  };
}

/**
 * Returns current occupancy stats (useful for admin dashboards & frontend).
 *
 * @returns {Object} Stats with activeTestTakers, maxConcurrent, availableSlots, occupancyPercent, timestamp
 */
function getStats() {
  _purgeExpired();

  const activeCount = activeSessions.size;
  const availableSlots = MAX_CONCURRENT - activeCount;
  const occupancyPercent = Math.round((activeCount / MAX_CONCURRENT) * 100);

  return {
    activeTestTakers: activeCount,
    maxConcurrent: MAX_CONCURRENT,
    availableSlots: availableSlots,
    occupancyPercent: occupancyPercent,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if a student has an active session
 *
 * @param {string} studentId - Student ID
 * @returns {boolean} True if student has active session
 */
function hasActiveSession(studentId) {
  _purgeExpired();
  return activeSessions.has(studentId);
}

/**
 * Get all active session IDs (for debugging/admin)
 *
 * @returns {Array<string>} Array of student IDs with active sessions
 */
function getActiveSessions() {
  _purgeExpired();
  return Array.from(activeSessions.keys());
}

/**
 * Get detailed info about all active sessions (for debugging/admin)
 *
 * @returns {Array<Object>} Detailed session information
 */
function getDetailedSessions() {
  _purgeExpired();
  const result = [];

  for (const [studentId, session] of activeSessions.entries()) {
    result.push({
      studentId,
      testId: session.testId || null,
      startedAt: new Date(session.startedAt).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
      durationMs: Date.now() - session.startedAt,
    });
  }

  return result;
}

/**
 * Reset all sessions (for testing/debugging only)
 * WARNING: Use with caution in production
 */
function resetAll() {
  activeSessions.clear();
  rateBuckets.clear();
  console.warn("[testSessionManager] ⚠️  All sessions reset!");
}

// ── Module Exports ─────────────────────────────────────────────────────────────

module.exports = {
  checkRateLimit,
  recordGeneration,
  acquireSlot,
  releaseSlot,
  getStats,
  hasActiveSession,
  getActiveSessions,
  getDetailedSessions,
  resetAll,
};
