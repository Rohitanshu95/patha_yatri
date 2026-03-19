const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const MANAGER_PLUS = ['manager', 'admin'];
const ADMIN_ONLY = ['admin'];

router.get('/revenue', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'Revenue summary' }));
router.get('/occupancy', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'Occupancy rate' }));
router.get('/gst', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'GST collected' }));
router.get('/audit-log', authenticate, authorize(...ADMIN_ONLY), (req, res) => res.json({ msg: 'Full audit log' }));

module.exports = router;
