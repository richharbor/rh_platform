const express = require('express');
const router = express.Router();
const contestController = require('../controllers/rhContestController');
const { authenticate } = require('../middleware/rhAuth');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public / User Routes
router.get('/my-status', authenticate, contestController.getUserContests);
router.post('/claim', authenticate, contestController.claimReward);

// Admin Routes
router.post('/', authenticateAdmin, contestController.createContest);
router.put('/:id', authenticateAdmin, contestController.updateContest);
router.delete('/:id', authenticateAdmin, contestController.deleteContest);
router.get('/admin/all', authenticateAdmin, contestController.getAdminContests);

module.exports = router;
