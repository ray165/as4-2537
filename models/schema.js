'use strict';

// load the things we need
var mongoose = require('mongoose');

//var bcrpyt = rquire('bcrypt-nodejs);


var chatSchema = new mongoose.Schema({
    authorName: String, //userID FK in this 
    message: String,
    postDate: { type: Date, default: Date.now } // need date for the history of ad posting
});


// create the model for users and expose it to our app
module.exports = {
    chatLog: mongoose.model('log', chatSchema),  // add a third parameter to specify collection... creates new if it doesnt exist
};