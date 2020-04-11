var express = require('express');
var UserController = require('../controllers/UserController');
var {authenticate,authorise} = require('../middleware/auth');
var router = express.Router();

/* GET users listing. */
router.get('/api/all',authenticate,authorise('admin'),UserController.getAllUsers);
router.post('/api/create',UserController.createUser);
router.post('/api/login',UserController.logIn);
router.put('/api/edit',authenticate,authorise('admin'),UserController.editUser);

module.exports = router;
