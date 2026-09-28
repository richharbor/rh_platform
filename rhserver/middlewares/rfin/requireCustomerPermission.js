const { can } = require("../../constants/rfin");

// Server-side twin of the clients' can(roles, module, action): the apps hide
// what a role can't do, this refuses it (rules in shared/rfin/src/rbac.json).
module.exports = (module, action) => (req, res, next) => {
  if (can(req.customer && req.customer.roles, module, action)) return next();
  return res.status(403).json({ error: `Your role can't ${action.replace(/_/g, " ")} ${module.replace(/_/g, " ")}` });
};
