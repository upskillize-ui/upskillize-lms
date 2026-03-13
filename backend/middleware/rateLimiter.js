// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redis = require("../services/redis"); // your ioredis client

// Global: all routes
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // 60 requests per user per minute
  standardHeaders: true,
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Strict: test generation only (expensive Claude calls)
const testGenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3, // 3 test generations per student per minute
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  keyGenerator: (req) => `testgen:${req.user?.id}`,
  message: { success: false, message: "Too many test requests. Please wait." },
});

module.exports = { globalLimiter, testGenLimiter };
