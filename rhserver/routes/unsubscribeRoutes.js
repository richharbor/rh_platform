const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");
const asyncWrapper = require("../utils/asyncWrapper");

const unsubscribeController = require("../controllers/unsubscribeController");

// Mounted at /unsubscribe by server.js.
// Ported from tps-next-backend's routes/emailUnsubscribeRoute.js.
//
// POST / — the PUBLIC unsubscribe-link endpoint hit by a clicked campaign
// email link (see service/email/unsubscribeToken.js + campaign send html).
// Deliberately NOT behind `authenticate` — a recipient clicking an email
// link has no admin session.
router.post("/", asyncWrapper(unsubscribeController.unsubscribeUser));

// Everything else is the authenticated admin-facing Unsubscribed page.
router.get(
  "/all-unsubscribed-users",
  authenticate,
  requirePermission("marketing", "manage_unsubscribes"),
  asyncWrapper(unsubscribeController.getUnsubscribedUsers)
);
router.get(
  "/export",
  authenticate,
  requirePermission("marketing", "manage_unsubscribes"),
  asyncWrapper(unsubscribeController.exportUnsubscribedUsers)
);

module.exports = router;
