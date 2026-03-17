/**
 * services/InstituteConfigManager.js
 *
 * Per-institute configuration for concurrent test limits.
 * Admins can change limits per college/institute from the admin panel.
 * Falls back to global default if no institute-specific config exists.
 *
 * Storage: In-memory (fast) + persisted to DB via InstituteConfig model.
 * On server restart, configs reload from DB automatically.
 */

const DEFAULT_GLOBAL_LIMIT = parseInt(
  process.env.MAX_CONCURRENT_TESTS || "200",
);
const DEFAULT_RATE_LIMIT = parseInt(process.env.TESTGEN_RATE_LIMIT || "5");

class InstituteConfigManager {
  constructor() {
    // Map<instituteId, { maxConcurrent, rateLimit, name, updatedAt }>
    this.configs = new Map();
    this.globalLimit = DEFAULT_GLOBAL_LIMIT;
    this.globalRateLimit = DEFAULT_RATE_LIMIT;

    // Load from DB on startup (non-blocking)
    this._loadFromDB().catch((e) =>
      console.warn("[InstituteConfig] DB load skipped:", e.message),
    );
  }

  /**
   * Load all institute configs from DB
   */
  async _loadFromDB() {
    try {
      const { InstituteConfig } = require("../models");
      const rows = await InstituteConfig.findAll();
      rows.forEach((row) => {
        this.configs.set(String(row.institute_id), {
          maxConcurrent: row.max_concurrent,
          rateLimit: row.rate_limit_per_hour,
          name: row.institute_name,
          updatedAt: row.updated_at,
        });
      });
      console.log(
        `[InstituteConfig] Loaded ${rows.length} institute config(s)`,
      );
    } catch {
      // Models may not exist yet — silent fallback to defaults
    }
  }

  /**
   * Get config for an institute (or global default)
   */
  getConfig(instituteId) {
    if (instituteId) {
      const cfg = this.configs.get(String(instituteId));
      if (cfg) return cfg;
    }
    return {
      maxConcurrent: this.globalLimit,
      rateLimit: this.globalRateLimit,
      name: "Default",
    };
  }

  /**
   * Update limit for a specific institute (called from admin panel)
   * Also persists to DB if model is available
   */
  async setInstituteLimit(instituteId, { maxConcurrent, rateLimit, name }) {
    const id = String(instituteId);
    const existing = this.configs.get(id) || {};

    const updated = {
      maxConcurrent:
        maxConcurrent ?? existing.maxConcurrent ?? this.globalLimit,
      rateLimit: rateLimit ?? existing.rateLimit ?? this.globalRateLimit,
      name: name ?? existing.name ?? `Institute ${id}`,
      updatedAt: new Date(),
    };

    this.configs.set(id, updated);

    // Persist to DB (non-blocking)
    try {
      const { InstituteConfig } = require("../models");
      await InstituteConfig.upsert({
        institute_id: Number(id),
        institute_name: updated.name,
        max_concurrent: updated.maxConcurrent,
        rate_limit_per_hour: updated.rateLimit,
      });
    } catch (e) {
      console.warn("[InstituteConfig] DB persist failed:", e.message);
    }

    console.log(`[InstituteConfig] Updated institute ${id}:`, updated);
    return updated;
  }

  /**
   * Update global default limit
   */
  setGlobalLimit(maxConcurrent, rateLimit) {
    if (maxConcurrent) this.globalLimit = maxConcurrent;
    if (rateLimit) this.globalRateLimit = rateLimit;
    console.log(
      `[InstituteConfig] Global limit updated: ${this.globalLimit} concurrent, ${this.globalRateLimit}/hr`,
    );
  }

  /**
   * Get all institute configs (for admin panel display)
   */
  getAllConfigs() {
    const result = [];
    for (const [id, cfg] of this.configs.entries()) {
      result.push({ instituteId: id, ...cfg });
    }
    return result;
  }

  /**
   * Delete an institute config (revert to global default)
   */
  async deleteInstituteConfig(instituteId) {
    const id = String(instituteId);
    this.configs.delete(id);
    try {
      const { InstituteConfig } = require("../models");
      await InstituteConfig.destroy({ where: { institute_id: Number(id) } });
    } catch {
      // Silent
    }
  }
}

module.exports = new InstituteConfigManager();
