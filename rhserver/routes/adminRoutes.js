const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
router.use(authorize("superadmin"));

// Application management
router.get("/applications", adminController.getApplications);
router.get("/applications/stats", adminController.getApplicationStats);
router.get("/applications/:applicationId", adminController.getApplicationById);
router.patch(
  "/applications/:applicationId/status",
  adminController.changeApplicationStatus
);
router.post("/applications/bulk-status", adminController.bulkChangeStatus);

// router.post("/invite-partner", adminController.invitePartner);

module.exports = router;
