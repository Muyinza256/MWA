const User = require('../models/User');
const {MWAError} = require('../utils/MWAError');
const S3 = require('../utils/S3Util');
const Post = require('../models/Post');
const UserService = require('../service/UserService');

exports.createPost = function(post,user,callback,errCallBack){
    try
    {
        new Post(post).save().then(pst => {
            if(user._sendNotifications)
            {
                sendNotificaton(user,pst,"New Post",callback,(err)=>console.log(err));
            }
            else{
                callback(pst)
            }
        }).catch(err => {
            errCallBack(new MWAError(500,"Failed to create Post"));
        });
    }
    catch(err)
    {
        errCallBack(new MWAError(500,"Failed to create Post"));
    }
}

function sendNotificaton(user,pst,event,callback,errCallBack){
    UserService.getUserFollowers(user._id,(followers) => {
        UserService.sendNotificationsToFollowers(
            followers,
            pst._id,
            event,
            user._id,
            () => {callback(pst)},
            (err) => {
                console.log(err);
                // errCallBack(new MWAError(500,"Failed to send notification"))
            });
    });
}

exports.likePost = function(user,postId,callback,errCallBack)
{
    try
    {
        Post.findById(postId).then(post => {
            post.addLike(user._id);
            post.save().then(pst => {
                if(user._sendNotifications)
                {
                    sendNotificaton(user,pst,"New like",callback,(err)=>console.log(err));   
                }
                else{
                    callback(pst);
                }
            }).catch(err => {
                errCallBack(new MWAError(500,"Failed to like Post"));
            })
        }).catch(err => {
            console.log(err);
            errCallBack(new MWAError(500,"Failed to like Post"));
        })
    }
    catch(err)
    {
        errCallBack(new MWAError(500,"Failed to like Post"));
    }
}

exports.addComment = function(user,postId,comment,callback,errCallBack)
{
    try
    {
        Post.findById(postId).then(post => {
            post.addComment(user._id,comment);
            post.save().then(pst => {
                if(user._sendNotifications)
                {
                    sendNotificaton(user,pst,"New Comment",callback,(err)=>console.log(err));
                }
                else
                {
                    callback(pst);
                }
            }).catch(err => {
                errCallBack(new MWAError(500,"Failed to add comment"));
            });
        }).catch(err => {
            console.log(err);
            errCallBack(new MWAError(500,"Failed to add comment"));
        });
    }
    catch(err)
    {
        errCallBack(new MWAError(500,"Failed to add comment"));
    }
}

exports.removeComment = function(postId,commentId,callback,errCallBack)
{
    try {
        Post.findById(postId).then(post => {
            post.removeComment(commentId);
            post.save().then(pst => {
                callback(pst)
            }).catch(err => {
                errCallBack(new MWAError(500,"Failed to remove comment"));
            });
        }).catch(err => {
            errCallBack(new MWAError(500,"Failed to remove comment"));
        });
    } catch (err) {
        errCallBack(new MWAError(500,"Failed to remove comment"));
    }
}

exports.removeLike = function(postId,likeId,callBack,errCallBack)
{
    try {
        Post.findById(postId).then(post => {
            post.removeLike(likeId);
            post.save().then(pst => {
                callBack(pst)
            }).catch(err => {
                errCallBack(new MWAError(500,"Failed to remove like"));
            });
        }).catch(err => {
            errCallBack(new MWAError(500,"Failed to remove like"));
        });
    } catch (error) {
        errCallBack(new MWAError(500,"Failed to remove like"));
    }
}

exports.addImage = function(postId,file,fileExtension,callback,errCallBack)
{
    S3.uploadFile(file,fileExtension,(fileName => {
        Post.findById(postId).then(pst => {
            pst.addImage(fileName);
            pst.save().then(newPst => {
                callback(pst);
            }).catch(errCallBack(new MWAError(500,"Failed to update post details")))
        }).catch(err => 
            errCallBack(new MWAError(500,"Failed to retrieve post details")
            ))
    }),errCallBack);
}

exports.downloadImage = async function(file,callBack,errCallBack){
    S3.downloadFile(file,(fileStream) => callBack(fileStream),errCallBack);
}

exports.getPost = function(postId,callback,errCallBack){
    try
    {
        Post.findById(postId).populate('_likes.user').populate('_comments.user')
        .then(post => {
            callback(post);
        }).catch(err => {errCallBack(new MWAError(500,"Failed to get post details"))})
    }
    catch(err){
        errCallBack(new MWAError(500,"Failed to get post details"));
    }
}

exports.getAllPosts = function(offset,limit,callback,errCallBack)
{
    Post.find().sort({_date:-1}).skip(offset).limit(limit).populate('_likes.user').populate('_comments.user')
    .then(posts => {
        callback(post);
    }).catch((err) => {
        errCallBack(new MWAError(500,"Failed to get posts"));
    })
}

function ageCalc(birthday)
{
  birthday = new Date(birthday);
  return new Number((new Date().getTime() - birthday.getTime()) / 31536000000).toFixed(0);
}

exports.getPosts = function(user,offset,limit,callback,errCallBack){
    var ids = user._following.map(f => f.user);
    var age = ageCalc(user._dateOfBirth);
    Post.find({
        $or:[
            {_user:{$in:ids}},
            {
                $and:[
                    {_isTargeted:true},
                        {
                            $or:[
                                {'_targetedAudience.street':user._address._street},
                                {'_targetedAudience.state':user._address._state},
                                {'_targetedAudience.city':user._address._city},
                                {'_targetedAudience.zip':user._address._zip},
                                {'_targetedAudience.age':age},
                            ]
                        }                            
                ]
            }
        ]
    }).sort({_date:-1}).skip(parseInt(offset)).limit(parseInt(limit)).populate('_likes.user').populate('_comments.user')
    .then(posts => {
        callback(posts);
    }).catch((err) => {
        console.log(err);
        errCallBack(new MWAError(500,"Failed to get posts"));
    })
}