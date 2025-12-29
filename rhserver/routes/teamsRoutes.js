const express = require("express");
const router = express.Router();
const teamsController = require("../controllers/teamsController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));

// // Application management
// router.get("/applications", adminController.getApplications);
// router.get("/applications/stats", adminController.getApplicationStats);
// router.get("/applications/:applicationId", adminController.getApplicationById);
// router.patch(
//   "/applications/:applicationId/status",
//   adminController.changeApplicationStatus
// );
// router.post("/applications/bulk-status", adminController.bulkChangeStatus);



router.get("/", teamsController.getAllTeamMembers);

router.get("/roles", teamsController.getAllRoles);

router.delete("/delete-role/:id", teamsController.deleteRole);

router.post("/create-role", teamsController.createRoles);

router.post("/invite-users", teamsController.inviteTeamMembers);

module.exports = router;
