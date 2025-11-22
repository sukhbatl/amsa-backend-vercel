const express = require('express');
const router = express.Router();
const InteractController = require('../controllers/interact');
const checkAuth = require('../middleware/checkAuth');


router.post('/comment', checkAuth, InteractController.newComment);
router.post('/like', checkAuth, InteractController.likeOrDislike);

module.exports = router;
