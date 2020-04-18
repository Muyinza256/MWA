const PostService = require('../service/PostService');
const Post = require('../models/Post');
const MWAError = require('../utils/MWAError');
const mongoose = require('mongoose');

exports.createPost = (req,res,nxt) => {
    var post = {
        _user:mongoose.Types.ObjectId(req.user._id),
        _text:req.body._text,
        _isTargeted:req.body._isTargeted,
        _targetedAudience:req.body._targetedAudience
    };
    PostService.createPost(post,req.user,(pst) => {
        res.json(pst);
    },err => {
        nxt(err);
    })
}

exports.uploadPostImage = (req,res,nxt) => {
    var fileExtenstion = path.extname(req.file.originalname).toLowerCase();
    PostService.addImage(req.query.postId,req.file.buffer,fileExtension,(pst) => {
        res.json(pst);
    },err => {
        nxt(err);
    })
}

exports.addComment = (req,res,nxt) => {
    PostService.addComment(req.user,req.body._postId,req.body._comment,(post) => {
        res.json(post);
    },err => {
        nxt(err);
    })
}

exports.removeComment = (req,res,nxt) => {
    PostService.removeComment(req.body._postId,req.body._commentId,(pst) =>{
        res.json(pst);
    },(err) => {
        nxt(err);
    })
}

exports.addLike = (req,res,nxt) => {
    PostService.likePost(req.user,req.body._postId,(pst) => {
        res.json(pst);
    },(err) => {
        nxt(err);
    })
}

exports.removeLike = (req,res,nxt) => {
    PostService.removeLike(req.body._postId,req.body._likeId,(pst) => {
        res.json(pst);
    },(err) => {
        nxt(err);
    })
}

exports.getPosts = (req,res,nxt) => {
    if(req.user._role == 'admin')
    {
        PostService.getAllPosts(req.query.offset,req.query.limit,(posts)=>{res.json(posts)},(err)=>{nxt(err)});
    }else{
        PostService.getPosts(req.user,req.query.offset,req.query.limit,(posts)=>{res.json(posts)},(err)=>{nxt(err)});
    }
}
