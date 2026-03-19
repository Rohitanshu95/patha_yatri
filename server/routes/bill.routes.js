const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const RECEPTIONIST_PLUS = ['receptionist', 'manager', 'admin'];
const MANAGER_PLUS = ['manager', 'admin'];

router.get('/:bookingId', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Get current bill for a booking' }));
router.patch('/:id/discount', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'Apply discount' }));
router.get('/:id/invoice', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Download PDF invoice' }));

module.exports = router;
