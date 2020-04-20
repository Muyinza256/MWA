const User = require('../models/User');
const {MWAError} = require('../utils/MWAError');
const S3 = require('../utils/S3Util');
const Post = require('../models/Post');
const UserService = require('../service/UserService');
const AdminService = require('../service/AdminService');
const EmailUtils = require('../utils/EmailUtils');

exports.createPost = function(post,user,callback,errCallBack){
    try
    {
        AdminService.getSpecialWords(words => {                        
            var word = words.find(wrd => post._text.includes(wrd._text));
            if(word)
            {
                post['_censured']= true;
                post['_healthy']= false;
            }            
            new Post(post).save().then(pst => {
                if(word)
                {
                    getUserUnhealthyPosts(user._id,(posts) => {
                        if(posts.length > 4)
                        {
                            UserService.deactivateUser(user._id,(uzr) => {
                                EmailUtils.sendEmail(uzr._email,"Deactivated account","Your account has been deactivated",() => {
                                    callback(pst);
                                })
                            },err =>{
                                console.log(err);
                            })
                        }
                        else
                        {
                            callback(pst);
                        }
                    },err =>{
                        console.log(err);
                    })
                }
                else
                {
                    if(user._sendNotifications)
                    {                    
                        sendNotificaton(user,pst,"New Post",callback,(err)=>console.log(err));            
                    }
                    else{
                        callback(pst)
                    }
                }
            }).catch(err => {
                console.log(err);
                errCallBack(new MWAError(500,"Failed to create Post"));
            });
        },err => {
            console.log(err);
            errCallBack(new MWAError(500,"Failed to create Post"));
        })
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
                getPst(pst._id,(fullPost) => {
                    if(user._sendNotifications)
                    {
                        sendNotificaton(user,fullPost,"New like",callback,(err)=>console.log(err));
                    }
                    else{
                        callback(fullPost);
                    }
                },err => {
                    console.log(err);
                    errCallBack(new MWAError(500,"Failed to get Post details"));
                })
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
                getPst(pst._id,(newPost) => {
                    if(user._sendNotifications)
                    {
                        sendNotificaton(user,newPost,"New Comment",callback,(err)=>console.log(err));
                    }
                    else
                    {
                        callback(newPost);
                    }
                },err => {
                    console.log(err);
                    errCallBack(new MWAError(500,"Failed to get Post details"));
                })
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
                getPst(pst._id,
                    (newPost) => {
                        callback(newPost);
                    },
                (err) => {
                    console.log(err);
                    errCallBack(new MWAError(500,"Failed to get comment details"));
                })
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
                getPst(pst._id,(newPost) => {
                    callBack(newPost);
                },(err) => {
                    console.log(err);
                    errCallBack(new MWAError(500,"Failed to remove like"));    
                })
            }).catch(err => {
                console.log(err);
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
                callback(newPst);
            }).catch(err => {
                console.log(err);
                errCallBack(new MWAError(500,"Failed to update post details"));
            })
        }).catch(err => 
            errCallBack(new MWAError(500,"Failed to retrieve post details")
            ))
    }),errCallBack);
}

exports.downloadImage = async function(file,callBack,errCallBack){
    S3.downloadFile(file,(fileStream) => callBack(fileStream),errCallBack);
}

function getPst(postId,callback,errCallBack){
    try
    {
        Post.findById(postId).populate('_likes.user').populate('_comments.user').populate('_user')
        .then(post => {
            callback(post);
        }).catch(err => {errCallBack(new MWAError(500,"Failed to get post details"))})
    }
    catch(err){
        errCallBack(new MWAError(500,"Failed to get post details"));
    }
}

exports.getPost = getPst;

exports.getAllPosts = function(offset,limit,callback,errCallBack)
{
    Post.find().sort({_date:-1}).skip(parseInt(offset)).limit(parseInt(limit)).populate('_likes.user').populate('_comments.user').populate('_user')
    .then(posts => {
        callback(posts);
    }).catch((err) => {
        console.log(err);
        errCallBack(new MWAError(500,"Failed to get posts"));
    })
}

exports.getAllPostsWithSearch = function(search,offset,limit,callback,errCallBack)
{
    User.find({
        $or:[
            {"_username":{$regex:search}},
            {"_lastname":{$regex:search}},
            {"_firstname":{$regex:search}}
        ]
    }).then(data => {
        var ids = data.map(d => d._id);
        Post.find({
            _user:{$in:ids}
        }).sort({_date:-1}).skip(parseInt(offset)).limit(parseInt(limit)).populate('_likes.user').populate('_comments.user').populate('_user')
        .then(posts => {
            callback(posts);
        }).catch((err) => {
            console.log(err);
            errCallBack(new MWAError(500,"Failed to get posts"));
        })
    }).catch(err => {
        console.log(err);
        errCallBack(new MWAError(500,"Failed to get posts"));
    })
}

exports.unCensurePost = function(postId,callback,errCallBack)
{
    console.log("uncensure post");
    Post.findById(postId).then(post => {
        post._censured = false;
        post.save().then(data => {
            getPst(post._id,newerPost => {
                callback(newerPost);
            },err => {
                errCallBack(new MWAError("Failed to uncensure post"));
            })
        }).catch(err => errCallBack(new MWAError("Failed to uncensure post")));
    }).catch(err => errCallBack(err));
}

function ageCalc(birthday)
{
  birthday = new Date(birthday);
  return new Number((new Date().getTime() - birthday.getTime()) / 31536000000).toFixed(0);
}

exports.getPostsWithSearch = function(user,search,offset,limit,callback,errCallBack){
    var ids = user._following.map(f => f.user);
    User.find({
        $and:[
            {_id:{$in:ids}},
            {
                $or:[
                    {"_username":{$regex:search}},
                    {"_lastname":{$regex:search}},
                    {"_firstname":{$regex:search}}
                ]        
            }
        ]
        }).then(data => {
        ids = data.map(d => d._id);
    Post.find({
        _user:{$in:ids}
    }).sort({_date:-1}).skip(parseInt(offset)).limit(parseInt(limit)).populate('_likes.user').populate('_comments.user').populate('_user')
    .then(posts => {
        callback(posts);
    }).catch((err) => {
        console.log(err);
        errCallBack(new MWAError(500,"Failed to get posts"));
    })
    });
}

exports.getPosts = function(user,offset,limit,callback,errCallBack){
    var ids = user._following.map(f => f.user);
    ids.push(user._id);
    var age = ageCalc(user._dateOfBirth);
    Post.find({
        $or:[
            {
                $and:[
                    {_censured:true},
                    {_user:user._id}
                ]
            },
            {
                $and:[
                    {_censured:false},
                    {
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
                    }
                ]
            }
        ]
    }).sort({_date:-1}).skip(parseInt(offset)).limit(parseInt(limit)).populate('_likes.user').populate('_comments.user').populate('_user')
    .then(posts => {
        callback(posts);
    }).catch((err) => {
        console.log(err);
        errCallBack(new MWAError(500,"Failed to get posts"));
    })
}
function getUserUnhealthyPosts(userId,callback,errCallBack){
    console.log();
    Post.find({
        $and:[
            {_user:userId},
            {_healthy:false}
        ]}).then(posts => callback(posts)).catch(err => errCallBack(err));
}

exports.getUserUnhealthyPosts = getUserUnhealthyPosts;