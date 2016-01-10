
module.exports = (function userSchema() {

"use strict";

	var mongoose = require('./db').mongoose;
//likeComments: [ comment: { type: mongoose.Schema.Types.ObjectId , ref: 'Comment', like: Boolean}],
	var theUserSchema = mongoose.Schema ({
		name: String,
		//likeArticles: [ { type: mongoose.Schema.Types.ObjectId , ref: 'Article', like: Boolean}],
		//likeComments: [ { type: mongoose.Schema.Types.ObjectId , ref: 'Comment', like: Boolean}],
		//comments: [ { type: mongoose.Schema.Types.ObjectId , ref: 'Comment'}],
		//followings: [{ type: mongoose.Schema.Types.ObjectId ,ref: 'User'} ],
        status:  String ,
		password: String,
		email:String,
		desc: String,
		image: String,
		dailyLimit: Number,
		recentUpdate: {type: Date, default: Date.now() },
		token: String,
		ban: [String],
		tags: [String]
	} );

	var collectionName = 'User';
	var User = mongoose.model(collectionName, theUserSchema);
	return User;
})();

