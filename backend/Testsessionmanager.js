/**
 * Testsessionmanager.js — OPTIMIZED FOR 200+ CONCURRENT STUDENTS
 *
 * FEATURES:
 * ✅ Support 200+ concurrent test-takers
 * ✅ Auto-cleanup of expired sessions
 * ✅ Rate limiting (5 tests per student per hour)
 * ✅ Real-time statistics
 * ✅ Performance logging
 */

const DEFAULT_MAX_CONCURRENT = parseInt(
  process.env.MAX_CONCURRENT_TESTS || 200,
);
const RATE_LIMIT_TESTS_PER_HOUR = parseInt(process.env.TESTGEN_RATE_LIMIT || 5);
const SESSION_TTL = parseInt(process.env.TEST_SESSION_TTL || 1800); // 30 minutes

class TestSessionManager {
  constructor() {
    this.activeSessions = new Map(); // Current test sessions
    this.sessionTimeouts = new Map(); // Auto-cleanup timers
    this.generationHistory = new Map(); // Rate limit tracking
    this.maxConcurrent = DEFAULT_MAX_CONCURRENT;

    this.startCleanupRoutine();
    this.logConfig();
  }

  logConfig() {
    console.log(`
╔════════════════════════════════════════╗
║  TestGen Session Manager Initialized   ║
╠════════════════════════════════════════╣
║ Max Concurrent:   ${this.maxConcurrent.toString().padEnd(23)} ║
║ Rate Limit:       ${RATE_LIMIT_TESTS_PER_HOUR} tests/hour${" ".repeat(21 - RATE_LIMIT_TESTS_PER_HOUR.toString().length)} ║
║ Session TTL:      ${SESSION_TTL}s (${(SESSION_TTL / 60).toFixed(0)} min)${" ".repeat(20 - SESSION_TTL.toString().length)} ║
║ Auto-Cleanup:     Every 60 seconds${" ".repeat(23 - "Every 60 seconds".length)} ║
╚════════════════════════════════════════╝
    `);
  }

  /**
   * Check if student is rate-limited
   * Returns: { limited: boolean, message: string, remaining: number, retryAfterSeconds: number }
   */
  checkRateLimit(studentId) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    if (!this.generationHistory.has(studentId)) {
      this.generationHistory.set(studentId, []);
    }

    const history = this.generationHistory.get(studentId);
    const recentTests = history.filter((time) => time > oneHourAgo);

    if (recentTests.length >= RATE_LIMIT_TESTS_PER_HOUR) {
      const oldestTest = Math.min(...recentTests);
      const retryAfter = Math.ceil((oldestTest + 60 * 60 * 1000 - now) / 1000);

      return {
        limited: true,
        message: `Rate limited: ${RATE_LIMIT_TESTS_PER_HOUR} tests/hour. Retry in ${Math.ceil(retryAfter / 60)} minutes.`,
        remaining: 0,
        retryAfterSeconds: retryAfter,
      };
    }

    return {
      limited: false,
      message: `✓ ${RATE_LIMIT_TESTS_PER_HOUR - recentTests.length} tests remaining this hour`,
      remaining: RATE_LIMIT_TESTS_PER_HOUR - recentTests.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Acquire a test slot for student
   * Returns: { ok: boolean, reason?: string }
   */
  acquireSlot(studentId) {
    // Check if student already has active session
    if (this.activeSessions.has(studentId)) {
      return {
        ok: false,
        reason:
          "You already have an active test. Complete it or wait for timeout.",
      };
    }

    // Check if slots available
    if (this.activeSessions.size >= this.maxConcurrent) {
      const waitTime = Math.ceil(SESSION_TTL / 60);
      return {
        ok: false,
        reason: `All ${this.maxConcurrent} slots occupied. Wait ${waitTime} min and retry.`,
      };
    }

    // Create session
    const session = {
      studentId,
      startTime: Date.now(),
      status: "active",
    };

    this.activeSessions.set(studentId, session);

    // Schedule auto-cleanup
    const timeout = setTimeout(() => {
      this.releaseSlot(studentId);
      console.log(`[AUTO-RELEASE] Slot released for student ${studentId}`);
    }, SESSION_TTL * 1000);

    this.sessionTimeouts.set(studentId, timeout);

    console.log(
      `[SLOT-ACQUIRED] Student ${studentId} | Active: ${this.activeSessions.size}/${this.maxConcurrent}`,
    );

    return { ok: true };
  }

  /**
   * Release a test slot
   */
  releaseSlot(studentId) {
    if (this.activeSessions.has(studentId)) {
      this.activeSessions.delete(studentId);
    }

    const timeout = this.sessionTimeouts.get(studentId);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimeouts.delete(studentId);
    }

    console.log(
      `[SLOT-RELEASED] Student ${studentId} | Active: ${this.activeSessions.size}/${this.maxConcurrent}`,
    );
  }

  /**
   * Record a test generation attempt for rate limiting
   */
  recordGeneration(studentId) {
    if (!this.generationHistory.has(studentId)) {
      this.generationHistory.set(studentId, []);
    }

    this.generationHistory.get(studentId).push(Date.now());
  }

  /**
   * Cleanup expired sessions (runs every 60 seconds)
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const expired = [];

    for (const [studentId, session] of this.activeSessions.entries()) {
      const sessionAge = (now - session.startTime) / 1000;

      if (sessionAge > SESSION_TTL) {
        expired.push(studentId);
      }
    }

    expired.forEach((studentId) => this.releaseSlot(studentId));

    if (expired.length > 0) {
      console.log(`[CLEANUP] Released ${expired.length} expired sessions`);
    }

    // Cleanup old rate limit history (older than 2 hours)
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    for (const [studentId, times] of this.generationHistory.entries()) {
      const recentTimes = times.filter((t) => t > twoHoursAgo);
      if (recentTimes.length === 0) {
        this.generationHistory.delete(studentId);
      } else if (recentTimes.length < times.length) {
        this.generationHistory.set(studentId, recentTimes);
      }
    }
  }

  /**
   * Start automatic cleanup routine (every 60 seconds)
   */
  startCleanupRoutine() {
    setInterval(() => this.cleanupExpiredSessions(), 60000);
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      activeTestTakers: this.activeSessions.size,
      maxConcurrent: this.maxConcurrent,
      availableSlots: this.maxConcurrent - this.activeSessions.size,
      occupancyPercent: Math.round(
        (this.activeSessions.size / this.maxConcurrent) * 100,
      ),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
module.exports = new TestSessionManager();
