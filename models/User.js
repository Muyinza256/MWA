const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const MWAError = require('../utils/MWAError').MWAError;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _firstname : {
        type: String,
        required:true
    },
    _lastname : {
        type: String,
        required: true
    },
    _username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true        
    },
    _email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    _password:{
        type:String,
        required:true
    },
    _role: {
        type: String,
        required: true
    },
    _status: {
        type: String,
        required: true
    },
    _sendNotifications: {
        type: Boolean,
        default: true
    },
    _following:[{
        user: {type:Schema.Types.ObjectId,ref:'User'}
    }],
    _notifications : [
        {
            post: {type:Schema.Types.ObjectId,ref:'Post'},
            seen:{type:Boolean,default:false}
        }
    ],
    _tokens:[String],
    _image:String
});

userSchema.methods.updateData = function updateFields(user){
    if(user._email)
    {
        this._email = user._email;
    }
    if(user._firstname)
    {
        this._firstname = user._firstname;
    }
    if(user._lastname)
    {
        this._lastname = user._lastname;
    }
    if(user._password)
    {
        this._password = user._password;
    }
    if(user._username)
    {
        this._username = user._username;
    }
};

userSchema.methods.generateToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id},process.env.JWT_KEY);
    user._tokens.push(token);
    await user.save();
    return token;
};

userSchema.methods.addFollower = function (followerId){
    var user = this._following.find(usr => usr.user == followerId);
    if(!user)
    {
        this._following.push({user:mongoose.Types.ObjectId(followerId)});
    }
}

userSchema.methods.removeFollower = function (followerId){
    var following = this._following.filter(usr => usr.user != followerId);
    console.log(following);
    this._following = following;
}

module.exports = mongoose.model('User',userSchema);
