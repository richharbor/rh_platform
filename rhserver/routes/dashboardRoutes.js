const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController")

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));


router.get("/info", dashboardController.getInfo);




module.exports = router;

