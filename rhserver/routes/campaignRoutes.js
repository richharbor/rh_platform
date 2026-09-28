const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");
const asyncWrapper = require("../utils/asyncWrapper");

const campaignController = require("../controllers/campaignController");

// Mounted at /campaigns by server.js.
// Ported from tps-next-backend's routes/campaignRoutes.js, dropping the
// /events-list and /resource-list routes (Event/Resource out of scope).
router.use(authenticate);

router.get("/", requirePermission("marketing", "view"), asyncWrapper(campaignController.getCampaigns));
router.post("/", requirePermission("marketing", "manage_campaigns"), asyncWrapper(campaignController.createCampaign));

router.get("/:id/preview", requirePermission("marketing", "view"), asyncWrapper(campaignController.previewRecipients));
router.post("/:id/send-test", requirePermission("marketing", "send_campaigns"), asyncWrapper(campaignController.sendTestMail));

router.get("/:id", requirePermission("marketing", "view"), asyncWrapper(campaignController.getCampaign));
router.patch("/:id", requirePermission("marketing", "manage_campaigns"), asyncWrapper(campaignController.updateCampaign));
router.delete("/:id", requirePermission("marketing", "manage_campaigns"), asyncWrapper(campaignController.deleteCampaign));

router.post("/:id/schedule", requirePermission("marketing", "send_campaigns"), asyncWrapper(campaignController.schedule));
router.post("/:id/cancel", requirePermission("marketing", "send_campaigns"), asyncWrapper(campaignController.cancelCampaignSchedule));

module.exports = router;
