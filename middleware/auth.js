const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {MWAError} = require('../utils/MWAError');

exports.authenticate = async(req,res,nxt) => {
    const token = req.header('Authorisation');
    const data = jwt.verify(token,process.env.JWT_KEY);
    try
    {
        const usr = await User.findOne({_id:data._id,_tokens:token})
        if(!usr){
            throw new Error();
        }
        if(!usr._status || usr._status == 'false' && !(req.body._unblockText))
        {
            nxt(new MWAError(401,"Account has been deactivated, please consult admin"));
            return;
        }
        req.user = usr;
        req.token = token;
        nxt();
    }
    catch(err)
    {        
        nxt(new MWAError(401,"Not authorised to access resource"));
    }
}

exports.authorise = (role) => {
    return (req,res,nxt) => {
        try
        {
            if(!req.user)
            {
                nxt(new MWAError(401,"Invalid access token used"));
                return;
            }
            if(req.user._role !== role)
            {
                nxt(new MWAError(401,"Insufficient permissions to access resource"));
                return;
            }
            nxt();
        }
        catch(err)
        {
            console.log(err);
            nxt(new MWAError(401,"Failed to resolve your permissions, Try again"));
        }
    };
}