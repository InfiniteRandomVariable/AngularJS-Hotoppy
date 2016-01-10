

module.exports = (function likeSchema() {
"use strict";

	var mongoose = require('./db').mongoose;
	var schema = {
		articleUrl: String,
		positive: Boolean,
		comment:{type: String, default: '' },
		userId: String
	};
	var collectionName = 'Like';
	var theLikeSchema = mongoose.Schema(schema);
	var Like = mongoose.model(collectionName, theLikeSchema);
	console.log('calling Like schema');	
	return Like;
})();


