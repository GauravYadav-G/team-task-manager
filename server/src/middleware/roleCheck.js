const prisma = require('../config/db');

/**
 * Middleware to check if the user is a member of the project
 * and optionally has a required role.
 * Attaches `req.memberRole` for downstream use.
 *
 * @param {string} requiredRole - 'ADMIN' or null (any member)
 */
function roleCheck(requiredRole = null) {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;

      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.userId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this project' });
      }

      if (requiredRole && membership.role !== requiredRole) {
        return res.status(403).json({ message: `This action requires ${requiredRole} role` });
      }

      req.memberRole = membership.role;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = roleCheck;
