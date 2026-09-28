const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");
const {
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  assignLead,
  unassignLead,
  deleteLead,
  deleteLeadsByIds,
  downloadLeads,
} = require("../controllers/leadController");

router.use(authenticate);

// Mounted at /leads by server.js — Platform Leads (admin-management only:
// list/filter/assign/status-update/download). No public lead-capture route
// exists in this build.
router.get("/", requirePermission("leads", "view"), getAllLeads);
router.get("/download", requirePermission("leads", "export"), downloadLeads);
router.get("/:id", requirePermission("leads", "view"), getLeadById);

router.patch("/:id/status", requirePermission("leads", "edit"), updateLeadStatus);
router.patch("/:id/assign", requirePermission("leads", "assign"), assignLead);
router.patch("/:id/unassign", requirePermission("leads", "assign"), unassignLead);

router.delete("/", requirePermission("leads", "delete"), deleteLeadsByIds);
router.delete("/:id", requirePermission("leads", "delete"), deleteLead);

module.exports = router;
