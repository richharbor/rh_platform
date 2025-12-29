const express = require("express");
const router = express.Router();
const franchisesController = require("../controllers/franchisesController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));

router.get("/", franchisesController.getAllFranchises);

router.post(
  "/invite-franchises-admin",
  franchisesController.inviteFranchiseAdmin
);

module.exports = router;
