const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    _user:{type:Schema.Types.ObjectId,ref:'User'},
    _text:String,
    _images:[String],
    _date:{type:Schema.Types.Date,default:Date.now},
    _likes:[{
        user:{type:Schema.Types.ObjectId,ref:'User'},
        time:{type:Schema.Types.Date,default:Date.now}
    }],
    _comments:[{
        user:{type:Schema.Types.ObjectId,ref:'User'},
        time:{type:Schema.Types.Date,default:Date.now},
        text:String
    }],
    _isTargeted:Boolean,
    _targetedAudience:{
        age:Number,
        street:String,
        state:String,
        city:String,
        zip:String
    }
});

postSchema.methods.addLike = function(userId)
{
    var like = this._likes.find(lk => (''+lk.user == ''+userId));
    if(!like)
    {
        this._likes.push({user:mongoose.Types.ObjectId(userId),time:new Date()});
    }
}

postSchema.methods.removeLike = function(likeId)
{
    this._likes = this._likes.filter(like => like._id != likeId);
}

postSchema.methods.addComment = function(userId,txt)
{
    this._comments.push({
        user:mongoose.Types.ObjectId(userId),
        text:txt,
        time:new Date()
    });
}

postSchema.methods.removeComment = function(commentId)
{
    this._comments = this._comments.filter(comment => comment._id != commentId);
}

postSchema.methods.addImage = function(image)
{
    this._images.push(image);
}

module.exports = mongoose.model('Post',postSchema);