// backend/middleware/auth.js
// HARDENED VERSION — fixes all edge cases causing
// "No authentication token provided"

const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────
// MAIN AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ FIX 1: Header completely missing
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    // ✅ FIX 2: Header exists but has no token after "Bearer "
    // Handles: "Bearer", "Bearer ", "Bearer null", "Bearer undefined"
    const parts = authHeader.split(" ");
    const token = parts.length === 2 ? parts[1] : null;

    if (
      !token ||
      token === "null" ||       // ← frontend sometimes sends "Bearer null"
      token === "undefined" ||  // ← frontend sometimes sends "Bearer undefined"
      token.length < 10         // ← clearly not a real JWT
    ) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    // ✅ FIX 3: JWT_SECRET not set in .env — gives a clear error instead of crashing
    if (!process.env.JWT_SECRET) {
      console.error("❌ CRITICAL: JWT_SECRET is not set in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // ✅ FIX 4: Verify and decode — separate expired vs invalid errors
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
          expired: true,  // ← frontend can detect this and redirect to /login
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // ✅ FIX 5: Decoded token is missing required fields
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.error("Auth middleware unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// ROLE GUARDS
// ─────────────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

const requireFaculty = (req, res, next) => {
  if (!req.user || (req.user.role !== "faculty" && req.user.role !== "admin")) {
    return res.status(403).json({
      success: false,
      message: "Faculty access required",
    });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access required",
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// EXPORTS — compatible with all import styles in your routes
// ─────────────────────────────────────────────────────────────
module.exports = authMiddleware;
module.exports.authMiddleware    = authMiddleware;
module.exports.authenticateToken = authMiddleware;  // alias
module.exports.requireAdmin      = requireAdmin;
module.exports.requireFaculty    = requireFaculty;
module.exports.requireStudent    = requireStudent;