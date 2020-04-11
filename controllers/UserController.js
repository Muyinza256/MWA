const UserService = require('../service/UserService');
const {MWAError,handleError} = require('../utils/MWAError');
const validator = require('validator');

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

exports.getAllUsers = (req,res,nxt) => {
    UserService.getUsers((users) => {
        res.json(users);
    },(err) =>{
        nxt(err);
    });
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