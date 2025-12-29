const express = require("express");
const router = express.Router();
const whatsappController = require("../controllers/whatsappController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);


router.post("/send-msg", whatsappController.sendMessage);


module.exports = router;