/**
 * middleware/auth.js — FIXED
 *
 * FIXES:
 * - Extracts role from multiple possible JWT fields (role, userRole, type)
 * - Normalizes role to lowercase immediately
 * - Better error messages for debugging
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "No authorization token provided",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "Invalid authorization header format",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // ✅ FIX: Check multiple possible role fields in JWT payload
    // Different auth flows may store role differently
    const rawRole =
      decoded.role ||
      decoded.userRole ||
      decoded.user_role ||
      decoded.type ||
      "student";

    req.user = {
      id: decoded.id || decoded.userId || decoded.user_id,
      email: decoded.email,
      // ✅ Always lowercase from the start — rbac.js also normalizes, double safety
      role: rawRole.toLowerCase().trim(),
      instituteId: decoded.instituteId || decoded.institute_id || null,
    };

    if (!req.user.id) {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "Invalid token: missing user ID",
      });
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ ok: false, success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ ok: false, success: false, message: "Invalid token" });
    }
    return res.status(401).json({
      ok: false,
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = authMiddleware;
