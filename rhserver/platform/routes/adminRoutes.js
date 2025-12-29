const express = require('express');
const router = express.Router();
const rhAdminAuthController = require('../controllers/rhAdminAuthController');
const rhAdminController = require('../controllers/rhAdminController');
const rhLeadController = require('../controllers/rhLeadController');
const { authenticateAdmin } = require('../middleware/authMiddleware'); // Need to create this middleware

// Admin Auth
router.post('/auth/login', rhAdminAuthController.login);
router.post('/auth/seed', rhAdminAuthController.seed);
router.get('/auth/me', authenticateAdmin, rhAdminAuthController.getMe);

// User Management
router.get('/users', authenticateAdmin, rhAdminController.listUsers);
router.put('/users/:id/approve', authenticateAdmin, rhAdminController.approvePartner);

// Dashboard & Stats
router.get('/dashboard', authenticateAdmin, rhAdminController.getDashboardStats);

// RM Management
router.get('/rm/list', authenticateAdmin, rhAdminController.listRMs);

// Lead Management (Admin actions)
router.get('/leads', authenticateAdmin, rhLeadController.adminList); // Use existing adminList
router.get('/leads/:id', authenticateAdmin, rhAdminController.getLead); // Use new getLead
router.post('/assign', authenticateAdmin, rhAdminController.assignLead);
router.put('/internal-status/:leadId', authenticateAdmin, rhAdminController.updateLeadInternalStatus);

// Roles & Invites
router.get('/roles', authenticateAdmin, rhAdminController.listRoles);
router.post('/roles', authenticateAdmin, rhAdminController.createRole);
router.post('/invite', authenticateAdmin, rhAdminController.inviteAdmin);

module.exports = router;
