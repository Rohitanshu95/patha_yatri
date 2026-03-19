const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.post('/login', (req, res) => res.json({ msg: 'Login logic' }));
router.post('/logout', authenticate, (req, res) => res.json({ msg: 'Logout logic' }));
router.get('/me', authenticate, (req, res) => res.json({ msg: 'Current user', user: req.user }));

module.exports = router;
