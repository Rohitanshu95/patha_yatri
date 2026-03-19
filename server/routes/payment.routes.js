const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const RECEPTIONIST_PLUS = ['receptionist', 'manager', 'admin'];
const MANAGER_PLUS = ['manager', 'admin'];

router.post('/', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Record manual payment' }));
router.post('/online/create-order', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Create Razorpay order' }));
router.post('/online/verify', (req, res) => res.json({ msg: 'Razorpay webhook verify' }));
router.post('/:id/refund', authenticate, authorize(...MANAGER_PLUS), (req, res) => res.json({ msg: 'Initiate refund' }));

module.exports = router;
