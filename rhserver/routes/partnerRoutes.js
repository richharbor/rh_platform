const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));

router.get("/roles", partnerController.getAllRoles);
router.post("/create-role", partnerController.createRoles);

router.delete("/delete-role/:id", partnerController.deleteRole);

// router.get("/partners", partnerController.getAllPartners);

router.get("/franchises", partnerController.getAllFranchisesForPartner);

router.get("/applications", partnerController.getAllPartnerApplications);

router.get("/partner-details", partnerController.getPartnerDetailsByUserId);

router.post("/invite-partner", partnerController.invitePartnerUsingEmail);

router.get("/my-profile", partnerController.getMyProfile);

router.get("/profile/:id", partnerController.getSellerProfile);

router.patch(
  "/applications/:applicationId/status",
  partnerController.changeApplicationStatus
);
module.exports = router;
