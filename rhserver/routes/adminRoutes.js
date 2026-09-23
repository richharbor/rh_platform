const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");
const { inviteAdmin, listAdmins, updateAdmin, removeAdmin } = require("../controllers/adminController");
const { listRoles, createRole, updateRole, deleteRole } = require("../controllers/roleController");

router.use(authenticate);

// Team management — Settings > Team
router.get("/", requirePermission("admin_management", "view"), listAdmins);
router.post("/invite", requirePermission("admin_management", "invite"), inviteAdmin);
router.patch("/:id", requirePermission("admin_management", "invite"), updateAdmin);
router.delete("/:id", requirePermission("admin_management", "remove"), removeAdmin);

// Role management — Settings > Roles
router.get("/roles/all", requirePermission("admin_management", "manage_roles"), listRoles);
router.post("/roles", requirePermission("admin_management", "manage_roles"), createRole);
router.patch("/roles/:id", requirePermission("admin_management", "manage_roles"), updateRole);
router.delete("/roles/:id", requirePermission("admin_management", "manage_roles"), deleteRole);

module.exports = router;
