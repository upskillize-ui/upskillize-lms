/**
 * middleware/rbac.js — FIXED
 *
 * ISSUE: 403 Forbidden on testgen routes
 * CAUSE: RBAC not properly checking student role
 * FIX: Updated to allow 'student' role properly
 */

const rbac = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // ✅ Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          success: false,
          message: "❌ Authentication required",
        });
      }

      // ✅ Get user role (default: student)
      const userRole = (req.user.role || "student").toLowerCase();

      // ✅ Check if role is allowed
      if (allowedRoles.length > 0) {
        const isAllowed = allowedRoles.some(
          (role) => role.toLowerCase() === userRole,
        );

        if (!isAllowed) {
          console.warn(
            `⚠️ User ${req.user.id} (role: ${userRole}) denied access. Required: ${allowedRoles.join(", ")}`,
          );

          return res.status(403).json({
            ok: false,
            success: false,
            message: `❌ Insufficient permissions. Your role: ${userRole}. Required: ${allowedRoles.join(", ")}`,
          });
        }
      }

      // ✅ User is authenticated and authorized
      next();
    } catch (error) {
      console.error("❌ RBAC error:", error.message);

      return res.status(500).json({
        ok: false,
        success: false,
        message: "❌ Authorization check failed",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
};

module.exports = rbac;
