"use strict"
const mongoose  = require('mongoose');

mongoose.Promise = require('bluebird');
mongoose.set('debug', true);
const Schema= mongoose.Schema;

const MessageSchema =  new Schema (
//data
{
	date:{type:String},
	message:{type:String},
	owner:{type: String},
	recipient:{type:String}
}, 
//options
{
	versionKey:false,
	collection:"messagesCollection"
})

module.exports = mongoose.model('messageModel',MessageSchema)