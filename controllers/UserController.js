const UserService = require('../service/UserService');
const {MWAError,handleError} = require('../utils/MWAError');
const validator = require('validator');
const path = require('path');

function validateUser(user){
    if(!validator.isEmail(user._email))
    {
        throw new MWAError(400,"Invalid email used");
    }
}

exports.createUser = (req,res,nxt) => {
    validateUser(req.body);
    UserService.createUser(req.body,
        (usr) => {            
            res.json(usr);
        },
        (err) => {
            nxt(err);
        });
};

exports.getUserProfile = (req,res,nxt) => {
    UserService.getUser(req.user._id,(user) => {
        res.json(user);
    },err => {
        nxt(err);
    });
}

exports.uploadUserImage = (req,res,nxt) => {
    var fileExtenstion = path.extname(req.file.originalname).toLowerCase();
    UserService.uploadUserImage(req.user,req.file.buffer,fileExtenstion,(user) => {
        res.json(user);
    },(err) => nxt(err));
}

exports.postFollowUser = (req,res,nxt) => {
    UserService.followUser(req.user._id,req.body.followerId,(usr) => {
        res.json(usr);   
    },err => nxt(err));
}

exports.postUnFollowUser = (req,res,nxt) => {
    UserService.unFollowUser(req.user._id,req.body.followerId,(usr) => {
        res.json(usr);
    },err => nxt(err));
}

exports.downloadImage = (req,res,nxt) => {
    var fileName = req.query.fileName;
    UserService.downloadImage(fileName,(fileStream)=>{
        res.attachment(fileName);
        fileStream.pipe(res);
    },(err) => nxt(err));
}

exports.getAllUsers = (req,res,nxt) => {
    UserService.getUsers((users) => {
        res.json(users);
    },(err) =>{
        nxt(err);
    });
};

exports.deactivateUser = (req,res,nxt) => {
    UserService.deactivateUser(req.body.userId,(user) => {
        res.json(user);
    },err => nxt(err));
};

exports.activateUser = (req,res,nxt) => {
    UserService.activateUser(req.body.userId,(user) => {
        res.json(user)
    },err => nxt(err));
};

exports.editUser = (req,res,nxt) => {
    UserService.updateUser(req.body,
        (usr) => {res.json(usr);},
        (err) => {nxt(err);});
}

exports.logIn = (req,res,nxt) =>{
    UserService.logIn(req.body._username,req.body._password,
        (usr) => {res.json(usr);},
        (err) => {nxt(err);});
}