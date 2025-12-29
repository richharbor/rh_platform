const express = require('express');
const router = express.Router();
const controller = require('../controllers/liquidateShareController');

// GET all records
router.get('/', controller.getAll);

// POST create a new record
router.post('/', controller.create);

module.exports = router;
