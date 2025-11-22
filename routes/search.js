const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/search');


// Fetching all posts
router.get('/quick', SearchController.quickSearchAll);
router.get('/all', SearchController.searchAll);


module.exports = router;
