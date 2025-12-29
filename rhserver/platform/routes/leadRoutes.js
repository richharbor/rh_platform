const express = require("express");
const router = express.Router();
const leadController = require("../controllers/rhLeadController");
const { authenticate, requireAdmin } = require("../middleware/rhAuth");

// User routes
router.post("/leads", authenticate, leadController.create);
router.get("/leads", authenticate, leadController.listMyLeads);
router.get("/leads/:id", authenticate, leadController.get);

// Admin routes
router.get("/admin/leads", authenticate, requireAdmin, leadController.adminList);

module.exports = router;
