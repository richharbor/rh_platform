const express = require('express');
const router = express.Router();
const controller = require('../controllers/rhRoleUpgradeController');
const { authenticate } = require('../middleware/authMiddleware');

// Client Routes (User)
router.post('/role-upgrade-request', authenticate, controller.submitRequest);
router.get('/role-upgrade-request', authenticate, controller.getMyRequestStatus);

// Admin Routes (Note: These might be mounted under /admin in app.js or here with prefix)
// Assuming app.js mounts this file for /v1, we need to handle admin routes separately 
// OR we export separate router?
// Usually the project has separate route files. I'll put admin routes in adminRoutes.js and client here.

module.exports = router;
