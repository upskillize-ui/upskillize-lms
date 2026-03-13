// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
});

const testGenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `testgen:${req.user?.id}`,
  message: { success: false, message: "Too many test requests. Please wait." },
});

module.exports = { globalLimiter, testGenLimiter };
