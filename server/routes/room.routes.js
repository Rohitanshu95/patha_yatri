const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const RECEPTIONIST_PLUS = ['receptionist', 'manager', 'admin'];
const ADMIN_ONLY = ['admin'];

router.get('/available', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Check available rooms' }));
router.get('/', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'List all rooms' }));
router.get('/:id', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Get single room details' }));
router.post('/', authenticate, authorize(...ADMIN_ONLY), (req, res) => res.json({ msg: 'Create room' }));
router.put('/:id', authenticate, authorize(...ADMIN_ONLY), (req, res) => res.json({ msg: 'Update room properties' }));
router.patch('/:id/status', authenticate, authorize(...RECEPTIONIST_PLUS), (req, res) => res.json({ msg: 'Change room status' }));

module.exports = router;
