const User = require('../models/User');
const bcrypt = require('bcrypt');
const {MWAError,handleError} = require('../utils/MWAError');
const saltRounds = 10;

exports.createUser = async function(user,callBack,errCallBack){
    try
    {
        var password = await bcrypt.hash(user._password,saltRounds);
        var userDets = {
            _username:user._username,
            _firstname:user._firstname,
            _lastname:user._lastname,
            _password:password,
            _email:user._email,
            _role:user._role,
            _status:true,
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

exports.logIn = async function(username,password,callBack,errCallBack){
    try
    {
        var usr = await User.findOne({_username:username});
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
        usr.updateData(user);
        usr.save();
        callBack(usr);
    }).catch(err => errCallBack(err));
};