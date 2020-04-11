const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    _user:{type:Schema.Types.ObjectId,ref:'User'},
    _images:[String],
    _date:{type:Schema.Types.Date,default:Date.now},
    _likes:[{
        user:{type:Schema.Types.ObjectId,ref:'User'},
        time:{type:Date,default:Date.now}
    }],
    _comments:[{
        user:{type:Schema.Types.ObjectId,ref:'User'},
        time:{type:Date,default:now},
        text:String
    }]
});

module.exports = mongoose.model('Post',postSchema);