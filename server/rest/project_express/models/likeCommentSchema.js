
module.exports.likeCommentSchema = (function likeCommentSchema() {


"use strict";
	var mongoose = require('./db').mongoose;
	var schema = {
		userId: String,
		userName: String,
		timeStamp: {type: Date, default: Date.now() }, 
		commentId: String,
		comment:{type: String, default: '' }, 
		articleId: String,
		positive: Boolean
	};
	var collectionName = 'LikeComment';
	var theLikeCommentSchema = mongoose.Schema(schema);
	var LikeComment = mongoose.model(collectionName, theLikeCommentSchema);
	console.log('calling Like schema');	
	return LikeComment;
})();


