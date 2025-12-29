const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const NotificationController = require("../controllers/notificationController")

const router = express.Router();

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));




router.post("/save-subscription", NotificationController.saveSubscription);

module.exports = router;
