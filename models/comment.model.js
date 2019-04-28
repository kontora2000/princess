"use strict"
const mongoose  = require('mongoose');

mongoose.Promise = require('bluebird');
mongoose.set('debug', true);
const Schema= mongoose.Schema;

const commentSchema =  new Schema (
//data
{
	date:{type:String},
	header:{type: String},
	content:{type:String},
	author:{type:String},
	avatar:{type:String}
}, 
//options
{
	versionKey:false,
	collection:"commentsCollection"
})

module.exports = mongoose.model('commentModel',commentSchema)