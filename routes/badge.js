const express = require('express');
const router = express.Router();
const BadgeController = require('../controllers/badge');
const checkAuth = require('../middleware/checkAuth');
const adminAuth = require('../middleware/adminAuth');


router.post('/new', checkAuth, adminAuth, BadgeController.newBadge);
router.post('/assign', checkAuth, adminAuth, BadgeController.assignBadge);
router.get('/', checkAuth, BadgeController.getBadges);
router.get('/all', BadgeController.getAllBadges);
router.get('/users/:id', checkAuth, BadgeController.getAllUsers);
router.delete('/:id', checkAuth, adminAuth, BadgeController.deleteBadge);

module.exports = router;
