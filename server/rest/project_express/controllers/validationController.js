
var userController = require("../controllers/userController");
var articleController = require("../controllers/articleController");

var BCRYPT_COST = 10;
var Promise = require("bluebird");
//var bcrypt = require('bcrypt');
var bcrypt = require('bcryptjs');


function validationController () {

	"use strict";
	var self = {};
//var TWENTY_FOUR = require("../controllers/userController").TWENTY_FOUR;
//"use strict";
// self.hello = 'hello';
	self.comparePassword = function (password, hash, callBack){

		bcrypt.compare(password, hash, function(err, result){
			if (err) throw new Error(err);
			callBack(err, result);
		});
	};

	self.generateHash = function (password, callBack){

		if (process.env.NODE_ENV === 'development') {
   			BCRYPT_COST = 1;
 		}

 		bcrypt.genSalt(BCRYPT_COST, function(err, salt){
	    	bcrypt.hash(password, salt, function(err, hash) {
	        	// Store hash in your password DB.
				callBack(err, hash);
	    	});
 		});	
	};

self.isBelowDailyLimit = function(userId, fn){

//	console.log('testing is below daily limit');
//	fn(null, null);
	//var t = userController.TWENTY_FOUR;
//	console.log(t);


	userController.isBelowDailyLimit(userId, function(belowLimit, dailyLimit){
		fn(belowLimit, dailyLimit);
	});
};

self.updateDailyLimitProcedure = function(userId, fn){

	userController.updateDailyLimitProcedure(userId, function(success){
		fn(success);
	});

};

self.findArticleById = function(artId, fn){

	articleController.findById(artId, function(article){
		fn(article);
	});
};

self.findUserById = function(userId, fn){

	userController.findById(userId, function(err, obj){
		fn(obj);
	});	
};



return self;
}

module.exports = new validationController();

//function isArray(myArray) {
 //   return myArray.constructor.toString().indexOf("Array") > -1;
//}