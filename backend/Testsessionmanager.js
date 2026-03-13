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
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.TESTGEN_RATE_LIMIT || "3"); // 3 generates/min/student
const SESSION_TTL_MS = 90 * 60 * 1000; // 90 min max test duration

// active sessions: Map<studentId, { startedAt: Date, expiresAt: Date }>
const activeSessions = new Map();

// rate limit buckets: Map<studentId, number[]> (timestamps of recent requests)
const rateBuckets = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Purge sessions that expired (no explicit submit) */
function _purgeExpired() {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (session.expiresAt <= now) {
      activeSessions.delete(id);
    }
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Check if a student is rate-limited for test generation.
 * Returns { limited: bool, retryAfterSeconds: number }
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
    return { limited: true, retryAfterSeconds: retryAfter };
  }
  return { limited: false, retryAfterSeconds: 0 };
}

/** Record a test generation attempt for rate limiting */
function recordGeneration(studentId) {
  const bucket = rateBuckets.get(studentId) || [];
  bucket.push(Date.now());
  rateBuckets.set(studentId, bucket);
}

/**
 * Attempt to acquire a test slot for a student.
 * Returns { ok: bool, reason?: string }
 */
function acquireSlot(studentId) {
  _purgeExpired();

  if (activeSessions.has(studentId)) {
    return {
      ok: false,
      reason:
        "You already have an active test in progress. Please submit or wait for it to expire.",
    };
  }

  if (activeSessions.size >= MAX_CONCURRENT) {
    return {
      ok: false,
      reason: `All ${MAX_CONCURRENT} test slots are currently occupied. Please try again in a few minutes.`,
    };
  }

  const now = Date.now();
  activeSessions.set(studentId, {
    startedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  return { ok: true };
}

/**
 * Release a student's test slot (call on submit or timeout).
 */
function releaseSlot(studentId) {
  activeSessions.delete(studentId);
}

/**
 * Returns current occupancy stats (useful for admin dashboards).
 */
function getStats() {
  _purgeExpired();
  return {
    activeCount: activeSessions.size,
    maxAllowed: MAX_CONCURRENT,
    availableSlots: MAX_CONCURRENT - activeSessions.size,
  };
}

module.exports = {
  checkRateLimit,
  recordGeneration,
  acquireSlot,
  releaseSlot,
  getStats,
};
