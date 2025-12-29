const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require authentication and superadmin role
router.use(authenticate);
// router.use(authorize("superadmin", "admin"));


router.get('/all-bookings/:id', bookingController.getAllBookings);
router.post("/book", bookingController.BookShare);
router.delete("/discard/:id", bookingController.discardBooking);
router.post('/close-deal', bookingController.closeDeal);
router.get('/my-bookings', bookingController.getMyBookings);
router.delete("/delete/:id", bookingController.deleteMyBooking);
router.post("/put-query", bookingController.putBuyQuery)
router.get("/all-buy-queries/:id", bookingController.getAllBuyQueries)
router.post('/close-buy-query', bookingController.closeQuery);
router.delete('/discard-buy-query/:id', bookingController.discardQuery);




module.exports = router;