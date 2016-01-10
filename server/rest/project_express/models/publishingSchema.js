
module.exports = (function publishingSchema() {

	var mongoose = require('./db').mongoose;

	var thePublishingSchema = mongoose.Schema ({
        titles: [ String ] ,
        pubs: [ String ] ,
       	pops: [ Number] ,
        tags: [ String ] ,
        likes: [ Number] ,
        urls: [ String ] ,
        imgUrls: [ String ] ,
        nComs: [ Number ] ,
        tComs: [ Number ] ,
		articleDates: [Date] ,
        comments: [ String] ,
		authors:[String],
		adComments: [String],
		adAuthors: [String],
		status: String,
		ver: {type:Number, default: 0},
		country: {type:String, default: 'USA'}
	});

	var collectionName = 'Publishing';
	var Publishing = mongoose.model(collectionName, thePublishingSchema);
		
	return Publishing;
})();

