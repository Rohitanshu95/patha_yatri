const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const RECEPTIONIST_PLUS = ['receptionist', 'manager', 'admin'];

router.post('/', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Register new guest' }));
router.get('/', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Search guests' }));
router.get('/:id', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Get guest profile' }));
router.put('/:id', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Update guest details' }));

module.exports = router;
