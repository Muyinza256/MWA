var express = require('express');
var AdminController = require('../controllers/AdminController');
var {authenticate,authorise} = require('../middleware/auth');
var router = express.Router();

router.post('/api/createWord',authenticate,authorise('admin'),AdminController.createSpecialWord);
router.get('/api/getWords',authenticate,authorise('admin'),AdminController.getSpecialWords);
router.get('/api/getRequests',authenticate,authorise('admin'),AdminController.getUnblockRequests);
router.put('/api/approveUnblockRequest',authenticate,authorise('admin'),AdminController.approveUnblockRequest);
router.put('/api/rejectUnblockRequest',authenticate,authorise('admin'),AdminController.rejectUnblockRequest);

module.exports = router;