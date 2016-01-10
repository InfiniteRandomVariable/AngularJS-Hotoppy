
module.exports = (function commentSchema() {

"use strict";

	var mongoose = require('./db').mongoose;

	var theCommentSchema = mongoose.Schema ({
		text:String,
		article: {type:  mongoose.Schema.Types.ObjectId, ref: 'Article'},
		postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		date: {type: Date, default: Date.now() },
        likes: Number 

	} );

	var collectionName = 'Comment';
	var Comment = mongoose.model(collectionName, theCommentSchema);
	return Comment;

})();

