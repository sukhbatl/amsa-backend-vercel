const express = require('express');
const router = express.Router();
const MembersController = require('../controllers/members');
const checkAuth = require('../middleware/checkAuth');
const adminAuth = require('../middleware/adminAuth');

router.get('/all', checkAuth, adminAuth, MembersController.getAllMembers);

router.get('/graduation-year', checkAuth, MembersController.getGraduationYearMembers);

module.exports = router;
