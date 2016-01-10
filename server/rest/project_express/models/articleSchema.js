
module.exports = (function articleSchema () {

 	var mongoose = require('./db').mongoose;

 	var schema = {
 		title: String,
 		pub: String,
        pop: {type:Number, default: 0},
        tag: String,
        likes: {type:Number, default: 0},
 		author: {type:String, default: ''},
 		url: String,
        imgUrl: String,
 		comment: String,
 		flags:{type:Number, default: 0},
 		tCom: {type:Number, default:0},
 		nCom: {type:Number, default:0},
 		adComment: String,
 		timeStamp: {type:Date, default: Date.now},
 		adAuthor:String
 	};
 	var collectionName = 'Article';
	var theArticleSchema = mongoose.Schema(schema);
 	var Article = mongoose.model(collectionName, theArticleSchema);
 	return Article;
 })();

