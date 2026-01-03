const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/rhNotificationController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const { authenticate } = require('../middleware/rhAuth'); // Basic user auth

// User Routes
router.post('/push-token', authenticate, notificationController.savePushToken);

// Admin Routes
router.post('/broadcast', authenticateAdmin, notificationController.broadcast);

module.exports = router;
