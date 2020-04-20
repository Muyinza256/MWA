const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wordsSchema = new Schema({
   _text:String 
});

module.exports = mongoose.model('SpecialWords',wordsSchema);