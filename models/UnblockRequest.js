const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnblockRequest = new Schema({
   _date:{type:Schema.Types.Date,default:Date.now},
   _text:String,
   _user:{type:Schema.Types.ObjectId,ref:'User'},
   _status:String
});

module.exports = mongoose.model('UnblockRequests',UnblockRequest);