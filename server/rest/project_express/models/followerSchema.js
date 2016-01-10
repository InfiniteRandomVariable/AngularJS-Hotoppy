
module.exports = (function followerSchema() {

"use strict";

	var mongoose = require('./db').mongoose;
	var theFollowerSchema = mongoose.Schema ({
		author: { type: mongoose.Schema.Types.ObjectId ,ref: 'User'},
		name: String,
		following: { type: mongoose.Schema.Types.ObjectId ,ref: 'User'} ,
		image: String
	} );
	var collectionName = 'Follower';
	var Follower = mongoose.model(collectionName, theFollowerSchema);
	return Follower;
})();

