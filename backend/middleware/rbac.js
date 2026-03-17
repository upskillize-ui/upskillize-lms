/**
 * middleware/rbac.js — FIXED
 *
 * ROOT CAUSE OF 403:
 * - rabc.js (typo file) was being required instead of rbac.js in some paths
 * - Role comparison was case-sensitive in old version
 * - JWT payload may store role as 'Student' (capital S) from some auth flows
 *
 * FIX: Case-insensitive comparison + clear error messages
 */

const rbac = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          success: false,
          message: "Authentication required",
        });
      }

      // ✅ CRITICAL FIX: Normalize role to lowercase
      // JWT tokens from different auth flows may have 'Student', 'STUDENT', 'student'
      const userRole = (req.user.role || "student").toLowerCase().trim();

      // Also normalize the allowed roles list
      const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase().trim());

      if (
        normalizedAllowed.length > 0 &&
        !normalizedAllowed.includes(userRole)
      ) {
        console.warn(
          `[RBAC] DENIED — user=${req.user.id} role="${userRole}" required="${normalizedAllowed.join("|")}"`,
        );
        return res.status(403).json({
          ok: false,
          success: false,
          message: `Access denied. Your role: "${userRole}". Required: "${normalizedAllowed.join('" or "')}"`,
        });
      }

      // ✅ Attach normalized role back so downstream code is consistent
      req.user.role = userRole;
      next();
    } catch (error) {
      console.error("[RBAC] Error:", error.message);
      return res.status(500).json({
        ok: false,
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};

module.exports = rbac;
