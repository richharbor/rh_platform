const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");
const uploadCsv = require("../middlewares/uploadCsv");
const asyncWrapper = require("../utils/asyncWrapper");

const {
  uploadContacts,
  getContactLists,
  getContactsByListId,
} = require("../controllers/contactController");

// Mounted at /contacts by server.js.
// Ported from tps-next-backend's routes/contactRoutes.js.
router.use(authenticate);

router.post(
  "/bulk-upload",
  requirePermission("marketing", "manage_contacts"),
  uploadCsv.single("file"),
  asyncWrapper(uploadContacts)
);
router.get("/", requirePermission("marketing", "view"), asyncWrapper(getContactLists));
router.get("/:id/contacts", requirePermission("marketing", "view"), asyncWrapper(getContactsByListId));

module.exports = router;
