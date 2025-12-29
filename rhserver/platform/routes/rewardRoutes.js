const express = require('express');
const router = express.Router();
const rhRewardController = require('../controllers/rhRewardController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/stats', authenticate, rhRewardController.getWalletStats);
router.get('/transactions', authenticate, rhRewardController.getTransactions);

module.exports = router;
