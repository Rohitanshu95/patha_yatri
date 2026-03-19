const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const RECEPTIONIST_PLUS = ['receptionist', 'manager', 'admin'];
const MANAGER_PLUS = ['manager', 'admin'];

router.post('/', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Create booking' }));
router.get('/', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'List bookings' }));
router.get('/:id', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Get booking details' }));
router.patch('/:id/checkin', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Check-in (creates bill)' }));
router.patch('/:id/checkout', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Check-out (finalizes bill)' }));
router.patch('/:id/cancel', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'Cancel booking' }));
router.post('/:id/services', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Add service' }));
router.delete('/:id/services/:sid', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'Remove service' }));

module.exports = router;
