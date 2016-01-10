var userController = require('../controllers/userController');
var validationController = require("../controllers/validationController");
var articleController = require("../controllers/articleController");
var likeController = require("../controllers/likeController");
var timeController = require("../controllers/timeController");
var mixController = require("../controllers/mixController");
var validating = require("../middleware/validating");
var logger = require("../helpers/logger.js");



 function restController(){

'use strict';

  //var currentVer = timeController.getCurrentPublishingTimeForVersion();

  var currentPub = {ver : null, result: null}; //caching the object.

 var self = {};

		self.getArticles = function (req, res, next) { 	
		 	  articleController.findAll(function(err, _result){
		 	  	var feedBackMessage = {'result':{'command':'', 'data':null},'status':true, 'error':null};
		 	  	feedBackMessage.result.data = _result.reverse();
		 	  	feedBackMessage.error = err;
     		return res.send(feedBackMessage);
      		});
		};

		// self.loginAccount = function (req, res, next) { 	
		//  	  articleController.findAll(function(err, _result){
		//  	  	var feedBackMessage = {'result':{'command':'', 'data':null},'status':true, 'error':null};
		//  	  	feedBackMessage.result.data = _result;
		//  	  	feedBackMessage.error = err;
  //    		return res.send(feedBackMessage);
  //     		});
		// };

	 self.createUser = function(req, res, next, model){
	 	var feedBackMessage = {'result':{'command':'', 'data':null},'status':true, 'error':null};
	 		feedBackMessage.status = false;
	 	if (!req.params.password || !req.params.email){
	 		feedBackMessage.result.command = 'no password or email';
	 		return res.send(feedBackMessage);
	 	}

	 	mixController.createUser({email: req.params.email, password: req.params.password}, function(err, result){


	 		if(result.succeed){
        feedBackMessage.status = true;
	 			feedBackMessage.result.data = result.token;
	 		}else{
	 			feedBackMessage.result.command = result.command;
	 		}
	 		
	 		//feedBackMessage.error = err;

	 		if (err){
        logger().error(err);
	 			feedBackMessage.status = false;
	 		}

	 		return res.send(feedBackMessage);

	 	});
	 };

	 self.loginUser = function(req, res, next, model){

         var email = req.params.email,
         password = req.params.password,
         feedBackMessage = {'result':{'command':'', 'data':''},'status':true, 'error':null};
         if (!email || !password){
         	feedBackMessage.status = false;
         	feedBackMessage.error = (!email || !password) ? 'require email' : 'require password';
         	return res.send(feedBackMessage);
         }
	 	validating().produceAccessTokenFullProcedureFunc( email, password , null, null ,function(err, token, succeed){


	 		if(token && token.length > 5){
	 			feedBackMessage.result.command = 'take token';
	 		}

 			feedBackMessage.result.data = token;
 			feedBackMessage.status = succeed;
 			feedBackMessage.error = err;
 			return res.send(feedBackMessage);
	 	});
	 };

	 // app.put('/createLike', restController.createLike);
	 // app.put('/createAccount', article.createArticle);
	 // app.put('/loginAccount', article.createArticle);
	 // app.put('/moreArticles', article.createArticle);


	 self.createLike = function(req, res, next, model) {

         var token = req.params.token, 
         articleUrl = req.params.articleUrl,
         isLikePositive = req.params.likePositive,
         feedBackMessage = {'result':{'command':''},'status':true, 'error':null};

         // console.log('create like 0 ' + articleUrl);
         if (!token || !articleUrl) {
         	feedBackMessage.result.command =  (!token || !articleUrl) ? 'need token 1' : 'need articleId 1';

         	feedBackMessage.status = false;
         	//console.log('create like 1 ' + feedBackMessage.result.command);
         	return res.send(feedBackMessage);
         }

         //console.log('create like 1.1');

         validating().verifyTokenFunc(token, function(err, decoded){

         	//		console.log('create like 1.2 error: ' + err + ' userId: ' + decoded.id + ' userId: ' + decoded._id);
	         		if (err || !decoded._id){
                //'to login page' co-depends on the backend
	         			feedBackMessage.result.command = 'to login page';
	         			feedBackMessage.error = err;
	         			feedBackMessage.status = false;
	         			//console.log('create like 2');
	         			return res.send(feedBackMessage);
	         		}

 				    // console.log('create like 4.01');

            	likeController.createLikeProcedure(decoded._id, articleUrl, isLikePositive, function(succeed, obj, message){

	            //	console.log('create like 4.1');
	              //if(err) throw new Error('Error: ' + err);
	              if(succeed){
	               	// console.log(JSON.stringify(doc));
	                //console.log('created like');
	                feedBackMessage.result.command = 'Like created';
                  feedBackMessage.status = true;
	                articleController.updateArticleLikeProcedure(articleUrl,isLikePositive, function(err, result){

	                	if (err){

                      logger().error(err);
                      //feedBackMessage.error = err;
                    } 

	                	return res.send(feedBackMessage);

	                } );
	                //console.log('create like 5');
	                
	              	}else{
                    if (message){
                      feedBackMessage.result.command = message; 
                    }else{
                      feedBackMessage.result.command = 'Operation Fail';  
                    }
	              		
	              		feedBackMessage.status = false;
	              		//console.log('create like 6');
	              		return res.send(feedBackMessage);
	              	} 
               		
            	});
		                    
        	 //});
         });
    };

    self.findPublisherProcedure = function(req, res, next, model){
    	var feedBackMessage = {'result':{'command':''},'status':true, 'error':null};
    	var ver = req.params.ver || null;
    	var _start =  req.params.start || null;
    	var _end =  req.params.end ||  null;

      //console.log("findPublisherProcedure start 1" + _start + " end " + _end);


    	var nu = parseInt(ver);
      console.log('searching for version: ' + nu);
    if (!isNaN(nu)){

		 
        // var currentPublishingVer = timeController.getCurrentPublishingTimeForVersion();
	       	var obj = {ver:nu, start: _start, end: _end};


            var startAndEnd = timeController.convertVerIntoStartAndEnd(ver, obj)

               articleController.findArticlesByDateRange( startAndEnd.start, startAndEnd.end, function(err, result){
                      console.log('findPublisherProcedure result.length: ' + result.length);
                      if(err) {
                      //  throw new Error(err);
                        return callBack(err, null);
                      }else{

                            feedBackMessage.result.data = result.reverse();
                            feedBackMessage.status = (!result) ? false : true;
                            feedBackMessage.result.command = (!result) ? 'result cant be nil' : 'ok';
                            return res.send(feedBackMessage);
                      }

            })

      

	       

    	}else{

    		feedBackMessage.status = false;
    		feedBackMessage.result.command = 'malform number';
    		return res.send(feedBackMessage);
    	}

    	
    };

    self.clearPublisher = function(){

    	currentPub = {ver : null};

    };

     self.createArticle = function (req, res, next) {

     
                var title = req.params.title;
                var pub = req.params.pub;

            	   var pop = Number(req.params.pop);
                 var tag = (req.params.tag ? req.params.tag : "" );
                 var likes = (Number(req.params.likes) ? req.params.likes : 0 );
                 var author = (req.params.author ? req.params.author : "" );
                 var _url = req.params.url;
                 var imgUrl = (req.params.imgUrl ? req.params.imgUrl : "" );
                 var comment = (req.params.comment ? req.params.comment : "");
                 var adComment = (req.params.adComment ? req.params.adComment : "" );
                 var adAuthor = ( req.params.adAuthor ? req.params.adAuthor : "" ) ;
                 var nCom = ( req.params.nCom ? req.params.nCom : 0 ) ;
                 var tCom = ( req.params.tCom ? req.params.tCom : 0 ) ;
                 var obj = { url: _url};
  				var dataObj = {title: title,pub: pub, pop : pop , tag : tag , likes : likes , author : author, url : _url , imgUrl : imgUrl, comment : comment , adComment : adComment, adAuthor : adAuthor, tCom: tCom, nCom: nCom};
  				

          if (Object.prototype.toString.call(req.params.timeStamp) === '[object Date]'){
              dataObj.timeStamp = req.params.timeStamp;            
          }else if (req.params.timeStamp){
            var timeStamp;
            console.log('restController timeStamp number ' + req.params.timeStamp);
           // timeStamp = !isNaN(parseFloat(req.params.timeStamp)) ? parseInt(req.params.timeStamp): null;
            var d = new Date(req.params.timeStamp);
            var checkDate = new Date();
            //24 * 60 * 60 * 1000
            checkDate.setTime(checkDate.getTime() - 24 * 60 * 60 * 1000 * 5);
            if( timeController.isValidDate(d) && d.getTime() > checkDate.getTime()){
              console.log('valid date');
              dataObj.timeStamp = d;
            }else{
              dataObj.timeStamp = new Date();
             // console.log('invalid date: ' + dataObj.timeStamp.getTime());
            }
          }


           console.log('restController create Article timeStamp:: ' + dataObj.timeStamp);

              articleController.findOne( obj , function(err1, result1){

                //console.log('CREATING ARTICLE: ' + title + ' ' + pub);
                 if (err1 || result1) {
                  console.log('result ' + result1);
                  //console.log('Found a duplicating artilce with title: ' + result1.title);

                  return res.send({'error':err1, 'status': false });

               }else if (result1){
                  
                  if (!result1._id){
                    throw new Error('result1._id cant be nil')
                    return 
                  }

                articleController.update(result1._id, {likes: dataObj.likes, comment: dataObj.comment, tCom: dataObj.tCom, nCom: dataObj.nCom}, function(err, doc){
                        if (err){
                          return res.send({'error':err, 'status': false });         
                        }else if (doc){

                          return res.send({'error':err, 'status': true });         
                        }else{
                          return res.send({'error': 'Unknown error occurred when updating article document', 'status': false });         
                        }  
                  });

               }else{
                console.log('creating article');
               articleController.create(dataObj, function(err, result, changes){
                     if (err) {
                          //      console.log(err);
                                return res.send({'error':err, 'hello': {'YES':'YEYES'}});
                        }
                        else {
                        //  console.log('article created');
                          return res.send({'result':result,'state':'successfully saved'});
                      }
               });

              }



           	});

     };

     self.updateArticleLikeProcedure = function(req, res, next, model){
     	var feedBackMessage = {'result':{'command':''},'status':true, 'error':null};
     	var articleUrl = req.params.url,
     	isLike = req.params.isLike;

     	articleController.updateArticleLikeProcedure(articleUrl, isLike, function(err, result){
     		if(err){

     			feedBackMessage.status = false;
     			feedBackMessage.error = err;

     		}else{
     			feedBackMessage.status = true;
     			feedBackMessage.result.command = 'article has been updated';
     		}

     		return res.send(feedBackMessage);

     	});





     };


 return self;
 }

module.exports = new restController();
