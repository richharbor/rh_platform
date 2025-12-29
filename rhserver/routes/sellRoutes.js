const express = require("express");
const router = express.Router();
const sellController = require("../controllers/sellController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));

router.get("/", sellController.getAllShares);

router.get("/all-sells", sellController.getAllSells);

router.get("/users-shares", sellController.getAllShareByUserId);

router.get("/share/:id", sellController.getSellsByShareId);
router.get("/share-detail/:id", sellController.getShareByShareId);

router.get("/sell/:id", sellController.getSellbySellId);

router.post("/create-sell", sellController.createSell);

router.put("/update-sell/:id", sellController.updateSell);

router.post("/add-bulk-shares", sellController.addBulkShares);

router.delete("/delete/:id", sellController.deleteSell);

//best deals

router.get("/all-best-deals", sellController.getAllBestDeals);
router.get("/all-non-approved-best-deals", sellController.getAllNonApprovedBestDeals);
router.put("/best-deal/approve/:id", sellController.approvedBestDeal);
router.put("/best-deal/discard/:id", sellController.discardBestDeal);
router.get('/best-deal/:id',sellController.getBestDealBySellId);

module.exports = router;
