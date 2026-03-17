/**
 * middleware/auth.js — FIXED
 *
 * ISSUE: 403 Forbidden on POST /api/testgen/generate
 * CAUSE: Middleware not properly checking authentication
 * FIX: Updated to properly verify JWT and extract user
 */

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // ✅ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "❌ No authorization token provided",
      });
    }

    // ✅ Extract token (format: "Bearer TOKEN")
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "❌ Invalid authorization header format",
      });
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );

    // ✅ Attach user to request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || "student",
    };

    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "❌ Invalid or expired token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        success: false,
        message: "❌ Token expired",
      });
    }

    return res.status(401).json({
      ok: false,
      success: false,
      message: "❌ Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = authMiddleware;
