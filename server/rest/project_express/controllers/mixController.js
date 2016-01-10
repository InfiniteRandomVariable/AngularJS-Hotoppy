var userController = require('../controllers/userController');
var likeController = require('../controllers/likeController');
var articleController = require('../controllers/articleController');
var timeController = require('../controllers/timeController');
var publishingController = require('../controllers/publishingController');
var validationController = require("../controllers/validationController");
var validating = require("../middleware/validating");
var Promise = require("bluebird");
var logger = require("../helpers/logger.js");

 function mixController(){

'use strict';
 var self = {};

	 var findByToken = function ( token, fn){

	 validating.verifyTokenFunc(token, function(err, decode){

	 	userController.findById(decode.id, function(){



	 	});

	 });

	 };

	 self.findbyToken = findByToken;


	 var isMatchTokenForUser = function(email, token, callBack){
	 		userController.findOneByEmail( email , function(err,obj){
	        	if (!obj)return callBack(false, obj);
	        	return callBack(obj.token == token, obj);
	        });

	 };

	 self.isMatchTokenForUser = isMatchTokenForUser;

	 var createUser = function(obj, callBack){
	 //	console.log('create user 0.00');
	 	if (!obj.email || !obj.password) throw new Error('need object email or password for creating user');
	// 	console.log('create user 0.01');

	 	userController.createProcedure(obj, function(err, result, changes){
	 ///		console.log('create user 0.02');
            if(err){ 
            	 callBack(err, {'succeed' : false, 'command': 'user already existed'});
            }
            else{
            	
        //    		console.log('create user 0.03 ' + result.name);
            		result.status = 'NEW';
                	//userController.create(obj, function(err, result, changes){

          //      		console.log('create user 0.04');
                		validating().produceTokenForUserFunc(result, null , function(token){

            //    			console.log('create user USERID: ' + result.id);
                			userController.update(result._id, {'token': token}, function(succeed){

                				return callBack(null, {'succeed' : succeed, 'token' : token});
                			} );
                		//
                		});

                	//} );

            
           }
        });

	 };

	 self.createUser = createUser;


	 /*
	use time stamp to find whether publishing is exist 
		if yes, return the publishing record.
		else, create publishing record and return publishing record.
	 */
	 self.findPublisherProcedure = function(obj, callBack){
	 	//version, start, end,

	 	

	 	if (!obj.ver){ 

	 		var e = new Error('Publishing version cant be nil');
	 		logger().error(e);
	 		throw e
	 	}

	 	publishingController.findOneByVersion(obj.ver, function(err, pub){
	 		if (err){ 
	 			var e = new Error('Find publishing by timeStamp');
	 			logger().error(e);
	 			throw e;
	 			}
	 		if(pub) return callBack(null,pub);
	 		//findArticlesByDateRange = function(start, end, callBack){
	 		

	 		var start, end, timeObj;
	 		if (obj.start && obj.end){

	 		  timeObj = timeController.convertVerIntoStartAndEnd(obj.ver, {start: obj.start, end: obj.end})
	 		}else{
	 			timeObj = timeController.convertVerIntoStartAndEnd(obj.ver, null)
	 		}


	 		// if(obj.ver && obj.ver > 1000 && obj.ver < 900000000000){

	 		// 	//var roundedVer = obj.ver;
	 		// 	var roundedVer = obj.ver + 1;
	 		// 	var versionEndTime = parseInt(	roundedVer * 60 * 1000 * 30);
	 		// 	console.log('versionEndTime ' + versionEndTime);
	 		// 	var end = new Date()
	 		// 	end.setTime(versionEndTime);
	 		// 	console.log('end ' + end);
	 		//  	start = new Date();
    //   			start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
    //   			console.log('start ' + start);

    //   			//return callBack(null,null);
	 		// 	//start  = new Date().setTime(versionEndTime )

	 		// }else{
	 		// 	console.log('1 start time ' + obj.start + ' end time ' + obj.end);
	 		// 	start  = obj.start ? new Date(obj.start) : timeController.getDateByHours(-24);
	 		// 	end = obj.end ?  new Date(obj.end) : timeController.getCurrentTime();			
	 		// }


	 		console.log('2 start time ' + timeObj.start + ' end time ' + timeObj.end + ' version ');

	 		// var start = obj.start && obj.Object.prototype.toString.call(obj.start) === '[object Date]' ? obj.start : timeController.getDateByHours(-24);
	 		// var end = obj.end && obj.Object.prototype.toString.call(obj.end) === '[object Date]' ? obj.end : timeController.getCurrentTime();


	 		articleController.findArticlesByDateRange(timeObj.start, timeObj.end, function(err, result){
	 				console.log('findPublisherProcedure result.length: ' + result.length);
	 				if(err) {
	 				//	throw new Error(err);
	 					return callBack(err, null);
	 				}else{
	 		//				 

	 						 publishingController.createPublishingProcedure(result, function(unCleanPub){

	 						if (!unCleanPub) return callBack('fail to create publishing', unCleanPub);
	 						return callBack(null, publishingController.clean(unCleanPub));
	 						//return callBack(null, unCleanPub);
	 				});

	 				}

	 		});

	 	});

	 };
   
    		

 return self;
 }

module.exports = new mixController();

