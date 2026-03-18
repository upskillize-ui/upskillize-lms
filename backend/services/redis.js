/**
 * services/redis.js
 *
 * Shared Redis client for:
 * - BullMQ queue (testQueue.js)
 * - Session persistence (Testsessionmanager.js)
 *
 * Uses ioredis — same library BullMQ requires.
 */

const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  // Required by BullMQ
  maxRetriesPerRequest: null,
  // Reconnect automatically
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  // Log reconnection attempts
  lazyConnect: false,
});

redis.on("connect", () => {
  console.log("[Redis] ✅ Connected");
});

redis.on("error", (err) => {
  console.error("[Redis] ❌ Error:", err.message);
});

redis.on("reconnecting", () => {
  console.warn("[Redis] 🔄 Reconnecting...");
});

module.exports = redis;
