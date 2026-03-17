/**
 * Testsessionmanager.js — UPDATED: Per-Institute Limits
 *
 * CHANGES FROM PREVIOUS VERSION:
 * ✅ Per-institute concurrent limits (via InstituteConfigManager)
 * ✅ Per-institute rate limits
 * ✅ getStats() now accepts optional instituteId
 * ✅ acquireSlot() checks institute-specific limit
 * ✅ checkRateLimit() uses institute-specific rate limit
 */

const instituteConfig = require("./InstituteConfigManager");

const SESSION_TTL = parseInt(process.env.TEST_SESSION_TTL || "1800"); // 30 min

class TestSessionManager {
  constructor() {
    this.activeSessions = new Map(); // studentId → session
    this.sessionTimeouts = new Map(); // studentId → timer
    this.generationHistory = new Map(); // studentId → [timestamps]

    this._startCleanupRoutine();
    console.log(
      "[TestSessionManager] Initialized (per-institute limits enabled)",
    );
  }

  /**
   * Check rate limit for a student
   * Uses institute-specific rate limit if available
   */
  checkRateLimit(studentId, instituteId = null) {
    const { rateLimit } = instituteConfig.getConfig(instituteId);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    if (!this.generationHistory.has(studentId)) {
      this.generationHistory.set(studentId, []);
    }

    const history = this.generationHistory.get(studentId);
    const recent = history.filter((t) => t > oneHourAgo);

    if (recent.length >= rateLimit) {
      const oldest = Math.min(...recent);
      const retryAfter = Math.ceil((oldest + 60 * 60 * 1000 - now) / 1000);
      return {
        limited: true,
        message: `Rate limit: ${rateLimit} tests/hour. Retry in ${Math.ceil(retryAfter / 60)} min.`,
        remaining: 0,
        retryAfterSeconds: retryAfter,
      };
    }

    return {
      limited: false,
      message: `${rateLimit - recent.length} tests remaining this hour`,
      remaining: rateLimit - recent.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Acquire a test slot
   * Checks institute-specific concurrent limit
   */
  acquireSlot(studentId, instituteId = null) {
    if (this.activeSessions.has(studentId)) {
      return {
        ok: false,
        reason: "You already have an active test session.",
      };
    }

    const { maxConcurrent } = instituteConfig.getConfig(instituteId);

    // Count active sessions for this institute (or global if no institute)
    const activeForInstitute = instituteId
      ? [...this.activeSessions.values()].filter(
          (s) => s.instituteId === String(instituteId),
        ).length
      : this.activeSessions.size;

    if (activeForInstitute >= maxConcurrent) {
      return {
        ok: false,
        reason: `All ${maxConcurrent} test slots are occupied. Please try again shortly.`,
      };
    }

    const session = {
      studentId,
      instituteId: instituteId ? String(instituteId) : null,
      startTime: Date.now(),
    };

    this.activeSessions.set(studentId, session);

    const timeout = setTimeout(() => {
      this.releaseSlot(studentId);
      console.log(`[AUTO-RELEASE] Session expired for student ${studentId}`);
    }, SESSION_TTL * 1000);

    this.sessionTimeouts.set(studentId, timeout);

    console.log(
      `[SLOT-ACQUIRED] student=${studentId} institute=${instituteId} active=${this.activeSessions.size}`,
    );

    return { ok: true };
  }

  /**
   * Release a test slot
   */
  releaseSlot(studentId) {
    this.activeSessions.delete(studentId);
    const t = this.sessionTimeouts.get(studentId);
    if (t) {
      clearTimeout(t);
      this.sessionTimeouts.delete(studentId);
    }
    console.log(
      `[SLOT-RELEASED] student=${studentId} active=${this.activeSessions.size}`,
    );
  }

  /**
   * Record a test generation for rate limiting
   */
  recordGeneration(studentId) {
    if (!this.generationHistory.has(studentId)) {
      this.generationHistory.set(studentId, []);
    }
    this.generationHistory.get(studentId).push(Date.now());
  }

  /**
   * Get stats — optionally scoped to an institute
   */
  getStats(instituteId = null) {
    const { maxConcurrent, name } = instituteConfig.getConfig(instituteId);

    const active = instituteId
      ? [...this.activeSessions.values()].filter(
          (s) => s.instituteId === String(instituteId),
        ).length
      : this.activeSessions.size;

    return {
      activeTestTakers: active,
      maxConcurrent,
      availableSlots: maxConcurrent - active,
      occupancyPercent: Math.round((active / maxConcurrent) * 100),
      instituteName: name,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all institute-scoped stats (for admin overview)
   */
  getAllInstituteStats() {
    const configs = instituteConfig.getAllConfigs();
    return configs.map((cfg) => {
      const active = [...this.activeSessions.values()].filter(
        (s) => s.instituteId === String(cfg.instituteId),
      ).length;
      return {
        ...cfg,
        activeTestTakers: active,
        availableSlots: cfg.maxConcurrent - active,
        occupancyPercent: Math.round((active / cfg.maxConcurrent) * 100),
      };
    });
  }

  _startCleanupRoutine() {
    setInterval(() => {
      const now = Date.now();
      for (const [id, session] of this.activeSessions.entries()) {
        if ((now - session.startTime) / 1000 > SESSION_TTL) {
          this.releaseSlot(id);
        }
      }
      // Clean old rate-limit history
      const twoHoursAgo = now - 2 * 60 * 60 * 1000;
      for (const [id, times] of this.generationHistory.entries()) {
        const fresh = times.filter((t) => t > twoHoursAgo);
        if (fresh.length === 0) this.generationHistory.delete(id);
        else if (fresh.length < times.length)
          this.generationHistory.set(id, fresh);
      }
    }, 60_000);
  }
}

module.exports = new TestSessionManager();
