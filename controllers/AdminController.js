const AdminService = require('../service/AdminService');
const User = require('../models/User');
const {MWAError} = require('../utils/MWAError');

exports.createSpecialWord = (req,res,nxt)=> {
    AdminService.createSpecialWord(req.body._text,(word) => res.json(word),err => nxt(err));
}

exports.getSpecialWords = (req,res,nxt) => {
    AdminService.getSpecialWords((words)=>res.json(words),err => nxt(err));
}

exports.approveUnblockRequest = (req,res,nxt) => {
    AdminService.approveUnblockRequest(req.query.id,data=>{
        User.findById(data._user).then(uzr => {
            uzr._status = true;
            uzr.save().then(rslt => res.json(data)).catch(err => {
                console.log(err);
                nxt(new MWAError(500,"Failed to update user details"));
            })
        })
    },err=> nxt(err));
}

exports.rejectUnblockRequest = (req,res,nxt) => {
    AdminService.rejectUnblockRequest(req.query.id,(rslt)=>res.json(rslt),err => nxt(err));
}

exports.getUnblockRequests = (req,res,nxt) => {
    AdminService.getUnblockRequests((data) => res.json(data),err => nxt(err));
}