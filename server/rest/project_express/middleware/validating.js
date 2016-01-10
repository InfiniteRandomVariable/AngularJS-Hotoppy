

//app.set('superSecret', config.secret); // secret variable


//TODO hashing the password
//	var bcrypt = require('bcrypt');	
// var _hash = ""

// bcrypt.genSalt(9, function(err, salt) {
//     bcrypt.hash('B4c0/\/', salt, function(err, hash) {
//         // Store hash in your password DB.
// 	_hash = hash
//     });
// });

// Load hash from your password DB.
// bcrypt.compare('B4c0/\/', _hash, function(err, res) {
//     // res == true
//      if (res === true) {
//        console.log("PASS");
//      }
//      else {
//         console.log("FAIL");
//      }
// });




var fs = require('fs');
var config = require('../config');
var path = require('path');
var userController = require('../controllers/userController');
var validationController = require("../controllers/validationController");
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var Promise = require("bluebird");
console.log('__dirname: ' + __dirname);
//fs.readFile(path.resolve(__dirname, 'settings.json'), 'UTF-8', callback);
var userAccessTokenKeyPrivate = fs.readFileSync(path.resolve(__dirname, 'private.pem'));
var userAccessTokenKeyPublic =fs.readFileSync(path.resolve(__dirname, 'public.pem'));

module.exports = function validating(){

'use strict';


	var TWENTY_FOUR_HOURS = 1440;
	var days = 10;
	var default_expiration = TWENTY_FOUR_HOURS * days;

	var loginPage = 'www.loginPage.com';

	//var tokenKey = userAccessTokenKey;

	//check daily limit
	//if excceed the limit, return immediately.
	
	function isUserAuthorized(userEmail, password, oldToken, callBack){
		if (!userEmail)return callBack('need user Email', false, null); // require userEmail to prevent brute forcing token.

		userController.findOneByEmail(userEmail, function(err, user){
			if(err)throw new Error(err);

			//console.log('isUserAuthorized 1 ' + user.dailyLimit + ' user empty' + !user);
			if (!user || user.dailyLimit > -1 === false ) return callBack(null, false, user);

			console.log('isUserAuthorized 2');

			userController.isBelowDailyLimitExp(user.dailyLimit, function(feedback, isBelowLimit){


				if (err) {
					throw new Error(err);
					//return callBack(err, false, user);
				}

				if (isBelowLimit === false) {
					
					return callBack(feedback, false, user);
				}
				if (password){
					console.log('isUserAuthorized 3 ' + password + ' user.password: ' + user.password);
					validationController.comparePassword( password, user.password, function(err, isMatch){
					console.log('isUserAuthorized 3.1 ' + isMatch);	
						return callBack(null, isMatch, user);	
					});
				}else{

					var isMatch  = (user && user.token === oldToken  || user && user.token === '' && oldToken !== null ) ? true : false ;
					console.log('isUserAuthorized 4 ' + isMatch);
					callBack(null, isMatch , user);	
				}
				

			});
			

		});

	}

	function produceTokenForUser(user, expirationTime , callBack){

		sanitizeUser(user).then(function(_user){ 

		//	console.log('produceAccessTokenFullProcedure 9');
			accessTokenFactory(_user, expirationTime, function(token){

					callBack(token);
			 });	
	});

	}


	function verifyToken(token, callBack){



		 jwt.verify(token, userAccessTokenKeyPublic, { algorithms: ['RS256'] }, function(err, decoded) { 
		      if (err) {
		        callBack(err, decoded);
		      } else {
		        // if everything is good, save to request for use in other routes
		        callBack(null, decoded);  
		      }
     	});
	}

	function accessTokenFactory(user, expirationTime, callBack){

		
		var expTime = (expirationTime) ? expirationTime : default_expiration;
	
		 var token = jwt.sign(user, userAccessTokenKeyPrivate , {
		 	algorithm: 'RS256', expiresIn: expTime      			
    		});


		 callBack(token);

	}


	function sanitizeUser(user){
		return new Promise(function(res, rej){
			user.password = null;
			user.email = null;
			res(user);
		});

		
	}

	//
	//if it fails to match, will increment a penality to the user account as a layer of protection against hackers.
	//if the token has been expired or the original user token is empty, it will recreate a new token.
	//
	// require userEmail to prevent brute forcing token.
	function produceAccessTokenFullProcedure(userEmail, password, oldToken, expirationTime, callBack){
			if (!userEmail)return callBack('need user Email', null, false);  // require userEmail to prevent brute forcing token.

			console.log('produceAccessTokenFullProcedure 0.01');
			//return callBack(err, null, false);
			isUserAuthorized(userEmail, password, oldToken, function(err, succeed_1, user){
				console.log('produceAccessTokenFullProcedure 0');
				if(err) {
					console.log('produceAccessTokenFullProcedure 1');
						console.log('Error: ' + err);
						if(err === 'aboveLimit') return callBack('redirect', null, false);
						return callBack(err, null, false);
				}

				
				
				console.log('produceAccessTokenFullProcedure 2');
				
				
				if (succeed_1 && user){

				console.log('produceAccessTokenFullProcedure 3 token: ' + oldToken);
				var theToken = (oldToken) ? oldToken : user.token; 
				verifyToken(theToken, function(err, decoded){

					console.log('produceAccessTokenFullProcedure 4');

						if (!err) {
							console.log('produceAccessTokenFullProcedure 5');
							//success, return the call.
							return callBack(null, theToken, true);
						}
						console.log('produceAccessTokenFullProcedure 6');
						for (var p in err){

							console.log('Prop: ' + p + ' . ' + err[p]);
						}

						var isIllegalError = (err.name ===  'JsonWebTokenError' && err.message === 'jwt must be provided' || err.name === 'TokenExpiredError') ? false: true;
						if (err.name && err.name.length > 1 && isIllegalError && user.token !== ''){ 

							console.log('produceAccessTokenFullProcedure 7 ' + err);
							//increment daily limit for this user.
							userController.updateDailyLimitProcedure(user.id, function(succeed){
								
							});
							return callBack(null, null, false);	
						} 


						
						console.log('produceAccessTokenFullProcedure 8');
					//	sanitizeUser(user).then(function(_user){ 

					//	console.log('produceAccessTokenFullProcedure 9');
					//	accessTokenFactory(_user, expirationTime, function(token){

					//		console.log('produceAccessTokenFullProcedure 10');	
						produceTokenForUser(user, expirationTime,function(token){
						 userController.update(user.id, {'token': token}, function(succeed){

						 	console.log('produceAccessTokenFullProcedure 11');	
							 	if(succeed){ 
							 		console.log('produceAccessTokenFullProcedure 11.1');	
							 		callBack(null, token, true);
							 	}else{
							 		console.log('produceAccessTokenFullProcedure 11.2');	
							 		callBack(new Error('Problem updating user record'), null, false);
							 	}
						 	});
						 });
						

						


					//	 });	
					//}); 						
				});	

				}else if (user){

					console.log('produceAccessTokenFullProcedure 12');
					//increment daily limit for this user.
					userController.updateDailyLimitProcedure(user.id, function(succeed){
					
								return callBack(null, null, false);	
						});


				}else{

					console.log('produceAccessTokenFullProcedure 13');
						//redirect
						return callBack('redirect', null, false);	
				}
		});
	}





	return {  
			produceTokenForUserFunc : produceTokenForUser, 
			sanitizeUserFunc : sanitizeUser, 
			accessTokenFactoryFunc: accessTokenFactory,
			isUserAuthorizedFunc: isUserAuthorized,
			verifyTokenFunc: verifyToken,
			produceAccessTokenFullProcedureFunc : produceAccessTokenFullProcedure,
			 accesstoken : function (req, res, next){
				  // check header or url parameters or post parameters for token
				  var token = req.body.token || req.query.token || req.headers['x-access-token'];
				  var password = req.body.pw || req.query.pw;
				  var email = req.body.email || req.query.email;

				  // decode token
				  if (email && token || email && password) {

				  	produceAccessTokenProcedure(email, password, token, null, function(err, token, pass){
				  		  if (err) {

				  		  		if (err === 'redirect') return res.redirect(loginPage, next);
				        		return res.json({ success: false, message: err } , next);   
				  			}

				  			if(!token) return res.json({ success: false, message: 'token cant be nil' }, next); 

				  			 // if everything is good, save to request for use in other routes
				  			req.token = token;
				  			next();
				  		});

				    // // verifies secret and checks exp
				    // jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
				    //   if (err) {
				    //     return res.json({ success: false, message: 'Failed to authenticate token.' });    
				    //   } else {
				    //     // if everything is good, save to request for use in other routes
				    //     req.decoded = decoded;    
				    //     next();
				    //   }
				    // });

				  } else {

				  	//increment user's dailylimit.
				  	//redirect
				  	return res.redirect(loginPage, next);

				    // if there is no token
				    // return an error
				    // return res.status(403).send({ 
				    //     success: false, 
				    //     message: 'No token provided.' 
				    // });
				    
				  }
					next();
		}
	};
};

