
var Like = require('../models/likeSchema');
var validationController = require('../controllers/validationController');
var userController = require('../controllers/userController');
var articleController = require('../controllers/articleController');

function likeController () {

"use strict";
	var self = {};
	var userId = 'userId';
	var articleUrl = 'articleUrl';
	var positive = 'positive';



  var remove = function(criteria, fn){
    if (criteria === null || criteria === undefined){

      fn(null, false);

    }else if (criteria === 'ALL'){
//.exec();

      Like.remove({}, function(err){

        if(err) {return fn(err, false); }
        fn(null, true);

          });

    }else{

      Like.findOneAndRemove(criteria, function(err){
        if(err) {return fn(err, false);}
        fn(null, true);

        });
    }


  };

  	self.remove = remove;



	function update(likeId, positiveLike, callBack){
		if (!likeId || typeof(positiveLike) !== 'boolean') throw new Error('Cannot be nil');

		    Like.update({ _id: likeId}, {'positive' : positiveLike}, {upsert: false}, function(err, doc){
		    	
        	 callBack(err, doc);

    	});


	}

	self.update = update;


	//keep this private
	function create(userIdStr, articleUrl, positiveLike, message, callBack){
		if(!userIdStr || !articleUrl || typeof(positiveLike) !== 'boolean') throw new Error('Error: parameter should not be nil in creating like record');

		Like.create({userId:userIdStr, articleUrl: articleUrl, positive : positiveLike, comment: message }, function(err, doc){
			callBack(err, doc);
		});

	}

	//this.create = create;


	function find(obj, callBack){

		if (obj !== Object(obj)) throw new Error('should be an object ' + obj);

	     Like.find( obj , function(err,obj){
                callBack(err, obj);
            });
	}

	self.find = find;

	function findByArticleUrl(_articleUrl, callBack){
		 if (!_articleUrl) throw new Error('Cannot be nil: ' + _articleUrl);

		 find({ articleUrl : _articleUrl }, function(err,objs){
                callBack(err, objs);
            });
     }

     self.findByArticleUrl = findByArticleUrl;

	function findByUserId(userIdStr, callBack){

		 if (!userIdStr) throw new Error('Cannot be nil: ' + userIdStr);
		 find({userId : userIdStr} , function(err,objs){
                callBack(err, objs);
            });
     }

     self.findByUserId = findByUserId;

    function findByUserIdAndArticleUrl(userIdStr, articleUrl, callBack){
      
     	if (!userIdStr || !articleUrl) throw new Error('Cannot be nil: user ' + userIdStr  + ' articleUrl ' + articleUrl);
      
		 find( {userId : userIdStr, articleUrl: articleUrl} , function(err,objs){

		 	//	var objStr = JSON.stringify(objs);
		 	//	console.log('findByUserIdAndArticleUrl objs length: ' + objStr);
                callBack(err, objs);
            });
     }

     self.findByUserIdAndArticleUrl = findByUserIdAndArticleUrl;

  	var didLikeArticles = function(userIdStr, articleUrl, positiveLike, callBack){

    //  console.log('articleUrl: ' + articleUrl);
  		findByUserIdAndArticleUrl(userIdStr, articleUrl,function( err, objs){
        console.log('Error: ' + err);
  			if (err) throw new Error('Error in didLikeArticles: ' + err);

  		//	console.log('didLikeArticles 1');

  			if (!objs) return callBack(false, []);

  			if ( Object.prototype.toString.call(  objs ) === '[object Array]' && objs.length > 0 
  				){
  			//	console.log('didLikeArticles 2');

  				var like = objs[0];
  				if (typeof(like.positive) === "boolean"){
  				//	console.log('didLikeArticles 3: ' + (like.positive === positiveLike));	
  					callBack((like.positive === positiveLike), objs);
  				}else{
  					throw new Error('Error in didLikeArticles: like.positive is undefined 1');
  				}

  			}else{
				callBack(false, []);
  			}

  		});
  };

  self.didLikeArticles = didLikeArticles;

//did user exist and is user below daily limit
//


  var createLikeProcedure = function(userIdStr, articleUrl, positiveLike, callBack){

  	//console.log(validationController.hello);
  	//return validationController.hello;
//isBelowDailyLimit
	
	//console.log('isBelowDailyLimit 1 ' + userIdStr + ' articleUrl ' + articleUrl);
	userController.updateDailyLimitProcedure(userIdStr, function(success){
			
    //  console.log('isBelowDailyLimit 2');
      var message = ''
			if(success === false)return callBack(false, null);
      //  console.log('isBelowDailyLimit 3');
  			didLikeArticles(userIdStr, articleUrl, positiveLike, function(didLike, obj ){
  			//	console.log('isBelowDailyLimit 4');
  				if (didLike === false &&  Object.prototype.toString.call(  obj ) === '[object Array]' ){
  	//				console.log('isBelowDailyLimit 5');
  						if (obj.length === 0 ){
  	//						console.log('isBelowDailyLimit 6');
                articleController.findByUrl(articleUrl, function(aerr, article){

                  if (aerr) throw new Error('Error: ' + aerr);

                  create(userIdStr, articleUrl, positiveLike, article.comment , function(err, doc){
    //              console.log('isBelowDailyLimit 7');
                    if (err) throw new Error('Error: ' + err);
                    callBack(true, doc);
                  
                  });


                });
  							
  						}else {
  				//			console.log('isBelowDailyLimit 6.1');
  							obj.forEach(function(ob){
  					//			console.log('isBelowDailyLimit 6.2');
  								update(ob.id, positiveLike , function(err, doc){
	  								if (err) throw new Error('Error ' + err);

	  								// userController.updateDailyLimitProcedure(userIdStr, function(success){
	  								 	callBack(false, obj);
	  								// });
  							});

  							});

  							

  						}

  				}else{
  	//						console.log('isBelowDailyLimit 6.3');
            message = 'Already done';
  					return callBack(false, null, message );
  				}


  			} );





	});

  	// userController.isBelowDailyLimit(userIdStr, function(belowLimit, dailyLimit){
  	// 	console.log('isBelowDailyLimit ' + belowLimit + ' dailyLimit: ' + dailyLimit);
  	// 	if( !belowLimit && !dailyLimit){
  	// 		//user doesn't exist
  	// //		console.log('isBelowDailyLimit 1');
  	// 		return callBack(null, null);
  	// 	}else if (belowLimit === false){
  	// //		console.log('isBelowDailyLimit 2');
  	// 		return callBack(false, null);
  	// 	}else {
  	// //		console.log('isBelowDailyLimit 3');
  	// 		didLikeArticles(userIdStr, articleIdStr, positiveLike, function(didLike, obj ){
  	// //			console.log('isBelowDailyLimit 4');
  	// 			if (didLike === false &&  Object.prototype.toString.call(  obj ) === '[object Array]' ){
  	// //				console.log('isBelowDailyLimit 5');
  	// 					if (obj.length === 0 ){
  	// //						console.log('isBelowDailyLimit 6');
  	// 						create(userIdStr, articleIdStr, positiveLike, function(err, doc){
  	// //							console.log('isBelowDailyLimit 7');
  	// 							if (err) throw new Error('Error ' + err);


  	// 							userController.updateDailyLimitProcedure(userIdStr, function(success){
  	// 								if(success) {console.log('isBelowDailyLimit 8');}
  	// 								else{console.log('isBelowDailyLimit 9');}
  	// 								return callBack(true, [doc]);
  	// 							});
  	// 						});
  	// 					}else {
  	// 						console.log('isBelowDailyLimit 6.1');
  	// 						obj.forEach(function(ob){
  	// 							console.log('isBelowDailyLimit 6.2');
  	// 							update(ob.id, positiveLike , function(err, doc){
	  // 								if (err) throw new Error('Error ' + err);

	  // 								userController.updateDailyLimitProcedure(userIdStr, function(success){

	  // 									if(success) {console.log('isBelowDailyLimit 10');}
	  // 									else{console.log('isBelowDailyLimit 11');}
	  // 									return callBack(true, obj);
	  // 								});
  	// 						});

  	// 						});

  							

  	// 					}

  	// 			}else{
  	// //						console.log('isBelowDailyLimit 6.3');

  	// 				return callBack(false, null);

  	// 			}


  	// 		} );

  	// 	}


  	// });

  };

  self.createLikeProcedure = createLikeProcedure;


  //   var findLikeArticle = function(userId, articles, fn){

  //   findById(userId, function(err, user){
  //       if(user.likeArticles){
  //           fn(likeArticles);
  //       }else{
  //           throw new Error('use like or dislike artical cant be emptied');
  //       }
  //   });
  // };


 self.createLike = function (req, res, next) {
                var artId = req.params.artId;
                var userId = req.params.userId;
                var positiveLike = req.params.positive;
                if (!artId || !userId || typeof(positiveLike) !== 'boolean' ) return  res.send({'error':'cant be null'});



                createLikeProcedure(userId, artId, positiveLike, function(err, result){

	                if (err) {
	                    console.log(err);
	                   return res.send({'error':err});
	                }
	                else {
	         	 		return res.send({'result':result,'status':'successfully saved'});
	      			}
                });
           	};

//function findLike

 return self;
 }

module.exports = new likeController();