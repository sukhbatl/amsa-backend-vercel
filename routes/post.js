const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post');
const checkAuth = require('../middleware/checkAuth');
const adminAuth = require('../middleware/adminAuth');


router.post('/newArticle', checkAuth, adminAuth, PostController.newArticle);
router.post('/newPost', checkAuth, PostController.newPost);
router.put('/updatePost/:id', checkAuth, PostController.updatePost);

router.delete('/deletePost/:id', checkAuth, PostController.deletePost);

router.get('/recentArticles', PostController.getRecentArticles);
router.get('/recentPosts', PostController.getRecentPosts);

router.get('/content/:id', PostController.getPost);

module.exports = router;
