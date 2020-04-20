const SpecialWords = require('../models/SpecialWords');
const UnblockRequest = require('../models/UnblockRequest');
const {MWAError} = require('../utils/MWAError');
const mongoose = require('mongoose');

exports.createSpecialWord = function (word,callback,errCallback){
    new SpecialWords({_text:word}).save().then(word => callback(word)).catch(err => errCallback(new MWAError(500,"Failed to save word")));
}

exports.getSpecialWords = function(callback,errCallback){
    SpecialWords.find().then(words => callback(words)).catch(err => errCallback(err))
}

exports.createUnblockRequest = function(userId,text,callback,errCallback){
    UnblockRequest.find({
        $and:[
            {_user:userId},
            {_status:'pending'}
        ]
    }).then(reslt => {    
        if(reslt && reslt.length > 0)
        {
            errCallback(new MWAError(400,'You already have a pending request.'))
        }
        else
        {
            new UnblockRequest({
                _text:text,
                _user:mongoose.Types.ObjectId(userId),
                _status:'pending'
            }).save().then(data => callback(data)).catch(err => errCallback(err));
        }
    },err => {
        console.log(err);
        errCallback(new MWAError(500,'Failed to submit request'))
    })
}

exports.rejectUnblockRequest = function(id,callback,errCallback){
    UnblockRequest.findById(id).then(data => {
        data._status = "Rejected";
        data.save().then(callback(data)).catch(err => errCallback(new MWAError(500,"Failed to update request")))
    }).catch(err => errCallback(new MWAError(400,"Failed to retrieve request")));
}

exports.approveUnblockRequest = function(id,callback,errCallback){
    UnblockRequest.findById(id).then(data => {
        console.log("req : "+data);
        data._status = "Approve";
        data.save().then(rslt => callback(rslt)).catch(err =>
            {
                console.log(err);
                errCallback(new MWAError(500,"Failed to update request"));
            })
    }).catch(err => {
        console.log(err);
        errCallback(new MWAError(400,"Failed to retrieve request"))
    });
}

exports.getUnblockRequests = function(callback,errCallback){
    UnblockRequest.find({_status:'pending'}).populate('_user')
    .sort({_date:-1})
    .then(data => callback(data)).catch(err => 
        {
            console.log(err);
            errCallback(new MWAError(400,"Failed to get requests"))
        })
}