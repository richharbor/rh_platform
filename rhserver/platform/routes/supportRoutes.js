const express = require('express');
const router = express.Router();
const rhSupportController = require('../controllers/rhSupportController');
const { authenticate } = require('../middleware/authMiddleware');

// User Routes (Authenticated)
router.post('/', authenticate, rhSupportController.createTicket);
router.get('/', authenticate, rhSupportController.listMyTickets);

module.exports = router;
