const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _firstname : {
        type: String,
        required:true
    },
    _lastname : {
        type: String,
        required: true
    },
    _username : {
        type: String,
        required: true,
        unique: true
    },
    _email: {
        type: String,
        required: true,
        unique: true
    },
    _role: {
        type: String,
        required: true
    },
    _status: {
        type: String,
        required: true
    },
    _sendNotifications: {
        type: Boolean,
        default: true
    },
    _following:[{
        user: {type:Schema.Types.ObjectId,ref = 'User'}
    }],
    _notifications : [
        {
            post: {type:Schema.Types.ObjectId,ref='Post'},
            seen:{type:Boolean,default:false}
        }
    ]
});

module.exports = mongoose.model('User',Schema);
