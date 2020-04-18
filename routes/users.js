var express = require('express');
var UserController = require('../controllers/UserController');
var {authenticate,authorise} = require('../middleware/auth');
var upload = require('../middleware/upload');
var router = express.Router();

/* GET users listing. */
router.get('/api/all',authenticate,UserController.getAllUsers);
router.post('/api/upload',authenticate,upload.single('image'),UserController.uploadUserImage);
router.get('/api/download',authenticate,UserController.downloadImage);
router.get('/api/profile',authenticate,UserController.getUserProfile);
router.post('/api/followUser',authenticate,UserController.postFollowUser);
router.post('/api/unFollowUser',authenticate,UserController.postUnFollowUser);
router.post('/api/deactivateUser',authenticate,authorise('admin'),UserController.deactivateUser);
router.post('/api/activateUser',authenticate,authorise('admin'),UserController.activateUser);
router.post('/api/create',UserController.createUser);
router.post('/api/login',UserController.logIn);
router.put('/api/edit',authenticate,UserController.editUser);
router.get('/api/viewNotification',authenticate,UserController.viewNotification)

module.exports = router;
