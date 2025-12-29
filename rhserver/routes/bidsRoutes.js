const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));


router.get('/all-bids/:id', bidController.getAllBids);
router.post("/bid", bidController.bidShare);
router.delete("/discard/:id", bidController.discardBid);
router.post('/close-deal', bidController.closeDeal);
router.get('/my-bids', bidController.getMyBids);
router.delete("/delete/:id", bidController.deleteMyBid);



module.exports = router;