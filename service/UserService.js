const User = require('../models/User');
const bcrypt = require('bcrypt');
const {MWAError,handleError} = require('../utils/MWAError');
const saltRounds = 10;
const S3 = require('../utils/S3Util');
const PostService = require('../service/PostService');
const mongoose = require('mongoose');

exports.createUser = async function(user,callBack,errCallBack){
    try
    {
        var tempUsr = await User.findOne({_username:user._username});
        if(tempUsr)
        {
            errCallBack(new MWAError(400,"Username is already in use by someone else"));
        }
        tempUsr = await User.findOne({_email:user._email});
        if(tempUsr)
        {
            errCallBack(new MWAError(400,"Email is already in use by someone else"));
        }
        var password = await bcrypt.hash(user._password,saltRounds);
        var userDets = {
            _username:user._username,
            _firstname:user._firstname,
            _lastname:user._lastname,
            _password:password,
            _email:user._email,
            _role:user._role,
            _status:true,
            _dateOfBirth:user._dateOfBirth,
            _address:user._address,
            _sendNotifications:user._sendNotifications
        };
        new User(userDets).save().then(async function(usr){
            await usr.generateToken();
            callBack(usr);
        }).catch(err => {
            errCallBack(err);    
        });
    }
    catch(err)
    {
        errCallBack(err);
    }
};

exports.deactivateUser = async function(userId,callBack,errCallBack){    
    User.findById(userId).then(user => {
        user._status = false;
        user.save();
        callBack(user);
    }).catch(err => {errCallBack(new MWAError(500,"Failed to deactivate user"))});
};

exports.activateUser = async function(userId,callBack,errCallBack){
    User.findById(userId).then(user => {
        user._status = true;
        user.save();
        callBack(user);
    }).catch(err => {errCallBack(new MWAError(500,"Failed to activate user"))});
};

exports.followUser = async function(userId,followingUserId,callBack,errCallBack){
    User.findById(userId).then(user => {
        user.addFollower(followingUserId);
        user.save();
        callBack(user);
    }).catch(err => {errCallBack(new MWAError(500,"Failed to add follower"))});
}

exports.unFollowUser = async function(userId,followingUserId,callBack,errCallBack){
    User.findById(userId).then(user => {
        user.removeFollower(followingUserId);
        user.save();
        callBack(user);
    }).catch(err => {errCallBack(new MWAError(500,"Failed to unfollow unfollow"))});
}

exports.uploadUserImage = async function(user,file,fileExtension,callBack,errCallBack)
{
    S3.uploadFile(file,fileExtension,(fileName => {
        user._image = fileName;
        user.save();
        callBack(user);
    }),errCallBack);
};

exports.downloadImage = async function(file,callBack,errCallBack){
    S3.downloadFile(file,(fileStream) => callBack(fileStream),errCallBack);
}

exports.getUser = async function(id,callBack,errCallBack){
    User.findById(id).populate('_following.user').populate('_notifications.madeBy').then(usr => {
        callBack(usr);
    }).catch(err => {
        errCallBack(new MWAError(404,"User not found"));
    });
}

exports.logIn = async function(username,password,callBack,errCallBack){
    try
    {
        var usr = await User.findOne({_username:username}).populate('_notifications.madeBy');
        if(!usr)
        {
            errCallBack(new MWAError(401,"Username doesnt match anyone's account"));
        }
        const doesPasswordMatch = await bcrypt.compare(password,usr._password);
        if(!doesPasswordMatch)
        {
            errCallBack(new MWAError(401,"Invalid credentials"));
        }
        callBack(usr);
    }
    catch(err)
    {
        console.log(err);
        errCallBack(new MWAError(401,"Failed to authenticate credentials"));
    }
}

exports.getUsers = (callBack,errCallBack) => {
    User.find().then(users => {
        callBack(users);
    }).catch(err => errCallBack(err))
}

exports.updateUser = (user,callBack,errCallBack) => {    
    User.findById(user._id).then(usr => {
        try
        {
            usr.updateData(user);
            usr.save();
            callBack(usr);
        }
        catch(err)
        {
            console.log('err');
            console.log(err);
            errCallBack(new MWAError(500,"Failed to update user details"));
        }
    }).catch(err => errCallBack(err));
};

exports.getUserFollowers = (userId,callBack,errCallBack) => {
    User.find({'_following.user':mongoose.Types.ObjectId(userId)}).then(followers => {
        callBack(followers);
    }).catch(err => {
        console.log(err);
    });
}

exports.sendNotificationsToFollowers = (users,postId,event,madeBy,callBack,errCallBack) => {
    try{
        for(var i = 0;i < users.length;i++)
        {
            this.sendNotification(users[i]._id,postId,event,madeBy,()=>{},(err)=>{console.log(err)});
        }
        callBack();
    }
    catch(err)
    {
        console.log(err);
    }
}

exports.sendNotification = function sendNotification(userId,postId,event,madeBy,callBack,errCallBack) {
    User.findById(userId).then(uzr => {
        uzr.addNotification(postId,event,madeBy);
        uzr.save().then(newUser => {
            callBack(newUser);
        }).catch(err => console.log(err))
    }).catch(err => console.log(err));
};

exports.retriveNotification = (userId,notificationId,callBack,errCallBack) => {
    User.findById(userId).then(user => {
        user.getNotification(notificationId).seen = true;        
        postId = user.getNotification(notificationId).post;
        user.save().then(uzr => {
            PostService.getPost(postId,callBack,errCallBack);
        }).catch(err => {
            console.log(err);
            errCallBack(new MWAError(500,"Failed to update user details"));
        });
    }).catch(err => {
        console.log(err);
        errCallBack(new MWAError(500,"Failed to retrieve user details"));
    });
}