const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const webSharesController = require("../controllers/webSharesController");

// Public routes
router.get("/", webSharesController.getAllWebShares);

// All admin routes require authentication and superadmin role
router.use(authenticate);


router.post("/create", webSharesController.createWebShare);

router.put("/update", webSharesController.updateWebShare);

router.delete("/delete/:id", webSharesController.deleteWebShare);

module.exports = router;
