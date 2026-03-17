/**
 * testSessionRoutes.js
 * Expose test session management endpoints for admin/monitoring
 */

const express = require("express");
const router = express.Router();
const sessionManager = require("../Testsessionmanager");
const authMiddleware = require("../middleware/auth");
const rbac = require("../middleware/rbac");

/**
 * GET /api/test-sessions/stats
 * Returns current test occupancy stats
 * Public (for display) or Admin only
 */
router.get("/stats", (req, res) => {
  try {
    const stats = sessionManager.getStats();
    return res.status(200).json({
      success: true,
      data: {
        activeTestTakers: stats.activeTestTakers,
        maxConcurrent: stats.maxConcurrent,
        availableSlots: stats.availableSlots,
        occupancyPercent: stats.occupancyPercent,
        timestamp: stats.timestamp,
      },
    });
  } catch (error) {
    console.error("Error fetching session stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch session statistics",
    });
  }
});

/**
 * POST /api/test-sessions/acquire
 * Attempt to acquire a test slot for the authenticated student
 * Protected - Student only
 */
router.post("/acquire", authMiddleware, rbac(["student"]), (req, res) => {
  try {
    const authStudentId = req.user?.id;

    // Validate student ID exists
    if (!authStudentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = sessionManager.acquireSlot(authStudentId);

    if (!result.ok) {
      return res.status(409).json({
        success: false,
        message: result.reason,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test slot acquired successfully",
      data: {
        studentId: authStudentId,
        slotAcquiredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error acquiring test slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to acquire test slot",
    });
  }
});

/**
 * POST /api/test-sessions/release
 * Release a test slot (call on submit or manual release)
 * Protected - Student only
 */
router.post("/release", authMiddleware, rbac(["student"]), (req, res) => {
  try {
    const authStudentId = req.user?.id;

    if (!authStudentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = sessionManager.releaseSlot(authStudentId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        studentId: authStudentId,
        releasedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error releasing test slot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to release test slot",
    });
  }
});

/**
 * POST /api/test-sessions/check-rate-limit
 * Check if student is rate-limited for test generation
 * Protected - Student only
 */
router.post(
  "/check-rate-limit",
  authMiddleware,
  rbac(["student"]),
  (req, res) => {
    try {
      const authStudentId = req.user?.id;

      if (!authStudentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const rateLimitResult = sessionManager.checkRateLimit(authStudentId);

      if (rateLimitResult.limited) {
        return res.status(429).json({
          success: false,
          message: rateLimitResult.message,
          data: {
            limited: true,
            retryAfterSeconds: rateLimitResult.retryAfterSeconds,
            remaining: rateLimitResult.remaining,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: rateLimitResult.message,
        data: {
          limited: false,
          retryAfterSeconds: 0,
          remaining: rateLimitResult.remaining,
        },
      });
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check rate limit",
      });
    }
  },
);

/**
 * POST /api/test-sessions/record-generation
 * Record a test generation attempt for rate limiting
 * Protected - Student only (internal use)
 */
router.post(
  "/record-generation",
  authMiddleware,
  rbac(["student"]),
  (req, res) => {
    try {
      const authStudentId = req.user?.id;

      if (!authStudentId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      sessionManager.recordGeneration(authStudentId);

      return res.status(200).json({
        success: true,
        message: "Generation recorded for rate limiting",
      });
    } catch (error) {
      console.error("Error recording generation:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to record generation",
      });
    }
  },
);

/**
 * GET /api/test-sessions/admin/stats
 * Admin-only endpoint with detailed stats
 * Protected - Admin only
 */
router.get(
  "/admin/stats",
  authMiddleware,
  rbac(["admin", "faculty"]),
  (req, res) => {
    try {
      const stats = sessionManager.getStats();
      return res.status(200).json({
        success: true,
        data: {
          activeTestTakers: stats.activeTestTakers,
          maxConcurrent: stats.maxConcurrent,
          availableSlots: stats.availableSlots,
          occupancyPercent: stats.occupancyPercent,
          timestamp: stats.timestamp,
          message: `${stats.activeTestTakers}/${stats.maxConcurrent} test slots occupied`,
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin statistics",
      });
    }
  },
);

// ✅ CRITICAL: Export the router
module.exports = router;
