var express = require('express');
var PostController = require('../controllers/PostController');
var {authenticate,authorise} = require('../middleware/auth');
var upload = require('../middleware/upload');
var router = express.Router();

router.post('/api/create',authenticate,PostController.createPost);
router.post('/api/upload',authenticate,upload.single('image'),PostController.uploadPostImage);
router.post('/api/comment',authenticate,PostController.addComment);
router.post('/api/unComment',authenticate,PostController.removeComment);
router.post('/api/like',authenticate,PostController.addLike);
router.post('/api/unlike',authenticate,PostController.removeLike);
router.get('/api/get',authenticate,PostController.getPosts);

module.exports = router;
