// RBAC middleware factory. Usage:
//   router.post('/add', authenticate, requirePermission('blogs', 'create'), addBlog)
//
// Expects req.permissions to already be populated by middlewares/authenticate.js,
// shaped as { [module]: { [action]: boolean } } — see models/role.js.
const requirePermission = (module, action) => (req, res, next) => {
  const permissions = req.permissions || {};
  const allowed = Boolean(permissions[module] && permissions[module][action]);

  if (!allowed) {
    return res.status(403).json({
      message: `Forbidden: missing permission ${module}.${action}`,
    });
  }

  next();
};

module.exports = requirePermission;
