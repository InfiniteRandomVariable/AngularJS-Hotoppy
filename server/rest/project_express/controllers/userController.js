
var User = require('../models/userSchema');
var validationController = require('../controllers/validationController');
var validator = require('validator');
var Promise = require("bluebird");


function userController () {

"use strict";
    var self = {};

    //var DAILY_LIMIT = -1;
    //var DAILY_LIMIT = 6;
    var DAILY_LIMIT = 50;
    //var TWENTY_FOUR = -1;
    var TWENTY_FOUR = 24;


    var findAll =  function(fn) {

        User.find({}, function(err, result) {
          fn(err, result);
        });

    };

    //support the search of obj or objStringId
    var findById = function ( _userObj, fn){

        var theUserId = ( _userObj.id) ? _userObj.id : (_userObj._id) ? _userObj._id : (_userObj ) ? _userObj: null ;

        if (!theUserId) throw new Error('userId cant be nil');

         User.findById( theUserId , function(err,obj){

                fn(err, obj);

        });
    };

   var findOneByName = function ( _userName, fn){
        User.findOne({name: _userName}, function(err,obj) { 
           fn(err, obj);
        });

    };

   var findOneByEmail = function ( _email, fn){
        var normalizeEmail = validator.normalizeEmail(_email);

        //console.log('normalizeEmail: ' + normalizeEmail);

        User.findOne({email: normalizeEmail }, function(err,obj) {
            //console.log('find one by email, obj: ' + obj);
           fn(err, obj);
        });
    };

    self.findOneByEmail = findOneByEmail;


    var simpleIsBelowDailyLimit = function(currentUserLimit){

        return currentUserLimit <  DAILY_LIMIT;
    };



    var isBelowDailyLimitExp = function(currentUserLimit, callBack){

        var belowLimit = simpleIsBelowDailyLimit(currentUserLimit);
        if(belowLimit === false) return callBack('aboveLimit',belowLimit);
        callBack(null ,belowLimit);

    };

    self.isBelowDailyLimitExp = isBelowDailyLimitExp;

// dont conjoin this func with updateDailyLimitProcedure as they serves similar actions.
    var isBelowDailyLimit = function(userId, fn){
        findById(userId, function(err, obj){

         

          //  console.log('obj.dailyLimit testing : ' +  obj.dailyLimit);
            var isBelow = simpleIsBelowDailyLimit(obj.dailyLimit);
           // console.log('obj.dailyLimit testing isBelow 1: ' + isBelow);

            if (err) {throw new Error('Error: ' + err); }
            if ( obj && !isNaN(parseFloat(obj.dailyLimit))){ 

             //    console.log('obj.dailyLimit testing isBelow 2: ' + isBelow);    
                fn( isBelow, obj.dailyLimit); }
            else { fn(null, null);}  //return null if the user doesn't exist.
        });    
        
    };



    var shouldResetDailyLimit = function(userId, fn){
        findById(userId, function(err, obj){

        

        //console.log('OBJECT shouldResetDailyLimit: ' + obj);

        

            if (err) {throw new Error('Error: ' + err); }
            if (!obj || !obj.recentUpdate){throw new Error('Error: user cant be ' + obj); }
            if( isNaN(parseFloat(obj.dailyLimit))){throw new Error('Error: dailylimit cant be null.. ' + obj.dailyLimit); }


           // console.log('shouldResetDailyLimit: ' + obj.email + ' dialyLimit: ' + obj.dailyLimit + ' userID: ' + obj._id);
            // compare whether the difference between current time and recent update exceeds 24 hours period.
            var diff = Date.now() - obj.recentUpdate;
            var hh = Math.floor(diff / 1000 / 60 / 60);
            console.log('hh ' + hh + ' TWENTY_FOUR ' + TWENTY_FOUR);
            if (hh > TWENTY_FOUR){
                //should reset time
                fn(true, obj.dailyLimit);
            }else{
                //should not reset time
                fn(false, obj.dailyLimit);
            }
        });        
    };

  var update = function(userId, obj,fn){

    if(obj.email) obj.email = validator.normalizeEmail(obj.email);

    User.update({ _id: userId}, obj, {upsert: false}, function(err, doc){

        if (err) throw new Error('Error reseting user.dailyLimit: ' + err);
        fn(true);

    });
  };

  self.update = update;


  var updateDailyLimit = function(userId, number,fn){

    User.update({ _id: userId}, {'dailyLimit' : Number(number)}, {upsert: false}, function(err, doc){

        if (err) throw new Error('Error reseting user.dailyLimit: ' + err);

        //if (err) return fn(false, null);
        return fn(true, doc);


    });
  };

  var resetDailyLimit = function(userId, num, date){
   // console.log('resetDailyLimit 1');
        var newTime = (Object.prototype.toString.call(date) === '[object Date]') ? date : new Date();
       // console.log('resetDailyLimit 2');
        var newNum = (!isNaN(parseFloat(num))) ? num : 1;
      //  console.log('resetDailyLimit 3');

        User.update({ _id: userId}, {'dailyLimit' : Number(newNum), 'recentUpdate': newTime}, {upsert: false}, function(err, doc){
      //    console.log('resetDailyLimit 4 ' + err);

        if (err) throw new Error('Error reseting user.dailyLimit: ' + err);
        fn(true, doc);

    });

  };

  //update daily limit procedure by reseting the daily limit or increment one if it meets specific conditions.
  var updateDailyLimitProcedure = function(userId, fn){
  //  console.log('updateDailyLimitProcedure 0');
    shouldResetDailyLimit(userId, function(shouldReset, dailyLimit){

        if(shouldReset){
    //        console.log('updateDailyLimitProcedure 1');
            resetDailyLimit(userId,function(success, doc){

                fn(success);
                //Date.now()
            });


        }else{

           

            var isBelow = simpleIsBelowDailyLimit(dailyLimit);
     //        console.log('updateDailyLimitProcedure 2 dailyLimit: ' + dailyLimit);

            if(isBelow){
                var newDailyLimit = dailyLimit + 1;

       //         console.log('updateDailyLimitProcedure 3 ' + userId + ' ' + newDailyLimit);
                updateDailyLimit(userId, newDailyLimit , function(success, doc){
         //           console.log('updateDailyLimitProcedure 5 ' + success + ' user: ' + doc);
                    fn(success);        
                });

            }else{

                fn(isBelow);
            }

            
        }

    });
  };





  var findLikeArticlesProcedure = function(userId, artId, fn){
    
    findLikeArticles(userId, function(arts){

        didLikeArticles(arts, artId, function(resultArts){
            fn(resultArts);

        });
    });
  };

  var updateLikeArticles = function(userId, articles,fn){

    User.update({ _id: userId}, {'likeArticles' : articles}, {upsert: false}, function(err, doc){

        if (err) throw new Error('Error reseting user.dailyLimit: ' + err);
        fn(true);

    });
  };



  var verifyLikeArticleProcedure = function(userId, artId, likeOrDislike ,fn){
    
    var didUserLikeArticle = false;
    var didMatchLike = false;
    findLikeArticlesProcedure(userId, artId, function(resultArts){
        if (resultArts && Object.prototype.toString.call(  resultArts ) === '[object Array]' && resultArts.length > 0){

                didUserLikeArticle = true;

               var matches =  resultArts.filter(function(art){
                    return validationController.findArticleById(art.id, function(result){

                            return result.like === likeOrDislike;

                    });

                });

               if (matches && Object.prototype.toString.call( matches ) === '[object Array]' && matches.length > 0){

                didMatchLike = true;

                fn(didUserLikeArticle, didMatchLike, matches, resultArts);

               }else{

                fn( didUserLikeArticle, didMatchLike, null, resultArts);

               }

            }else{
                fn(didUserLikeArticle, didMatchLike, null, resultArts);
            }

    });
    
  };

  var verifyAndUpdateLikeArticleProcedure = function(userId, artId, likeOrDislike ,fn){

    verifyLikeArticleProcedure(userId, artId, likeOrDislike, function(didUserLikeArticle, didMatchLike, matches, likeArticles){

        if(didUserLikeArticle && didMatchLike === true){
            return fn(false);
        }

        var unmatchArts = likeArticles.filter(function(art){
                return art.id != artId;
            });
         var newMatches = [];


        if (matches && Object.prototype.toString.call( matches ) === '[object Array]' &&  shouldUpdateUser){

            //var m = matches[0];  
            for (i = 0; i < matches.length; i++) { 
                var m = matches[i];
                m.like = !m.like;
                newMatches.push(newMatches);
             }

        }

        var finalArts = unmatchArts.concat(newMatches);
        updateLikeArticles(userId, finalArts,function(success){
            if (!success) throw new Error('Error: fail to update user for new likeArticles');
            fn(true);
        });

    });

  };

  var remove = function(criteria, fn){
    if (criteria === null || criteria === undefined){

      fn(null, false);

    }else if (criteria === 'ALL'){
//.exec();

      User.remove({}, function(err){

        if(err) {return fn(err, false); }
        fn(null, true);

          });

    }else{

      User.findOneAndRemove(criteria, function(err){
        if(err) {return fn(err, false);}
        fn(null, true);

        });
    }


  };


  var isEmailExist = function(email, fn){
            //console.log('isEmailExist ' + email + ' ' + validator.isEmail(email));
            if (!email || validator.isEmail(email) === false) {return fn(false, null);}

            
            findOneByEmail(email, function(err, obj){
                

                if(err) throw new Error("err occurred finding email: " + err);


                if (!obj || validator.isEmail(obj.email) === false){
                    fn(false, obj);
                }else{
                    fn(true, obj);
                }                    

            });
        

  };

  var isUserExist = function(name, email, fn){

    var isExist = false;
  //  console.log('isUserExist 0.01');
    if (name){
    //    console.log('isUserExist 0.02');
        findOneByName(name, function(err, obj){

      //      console.log('isUserExist 0.03');

            if(err) throw new Error("err occurred: " + err);
            if (!obj || obj.name.length < 1){
                return fn(isExist, obj);
            }
            var nEmail = validator.normalizeEmail(email);
            if (obj.email ===  nEmail){
                return fn(true, obj);
            }


            if(nEmail){
        //        console.log('isUserExist 0.04');                
                isEmailExist(nEmail, function(success, _obj){
                    fn(success, _obj);
                });

            }else{
                //prevent user to login
                fn(true, obj);

            }
        });

    }else if(email){

      var nEmail = validator.normalizeEmail(email);
           //     console.log('isUserExist 0.06');
        isEmailExist(nEmail, function(success, _obj){
           // console.log('isUserExist 0.07 success ' + success + ' ' + _obj);
                fn(success, _obj);
            });

    }else{

        //console.log('isUserExist 0.08');
        fn(false, undefined);
        throw new Error("Require Name, currently: " + name);

    }


  };


  var create = function(obj, fn){

        

        if (obj.status === 'NEW' && validator.isEmail(obj.email)){
            var ps = obj.password ? obj.password : '';
            var normEmail = validator.normalizeEmail(obj.email);

            if (!obj.name || obj.name.length === 0){
                obj.name = obj.email;
            }

            User.create({name: obj.name, email: normEmail , likeArticles : [], likeComments: [], comments: [], dailyLimit: 0,followings: [], status: obj.status, password: ps, desc: '', image: '', tags: [] }, function(err, result, changes) {

                if(err) {throw new Error('Error creating user 1: ' + err);}
                fn(err, result, changes);

            });
        }else{
            throw new Error('Error creating user 2: ');
        }

    };

      var createProcedure = function(obj, fn){
       // console.log('createProcedure 0.001');
       // console.log('createProcedure 0.01 obj.email: ' + obj.email );

        var _obj = {name: obj.name , email: obj.email, likeArticles : [], likeComments: [], dailyLimit: 0, comments: [], followings: [], status: 'NEW', desc: '', image: '', tags: [] };
       // console.log('createProcedure 0.02');
        isUserExist(_obj.name, _obj.email, function(success, user){
         //   console.log('createProcedure 0.03');
            if(success === false && !user){
            validationController.generateHash(obj.password, function(err, hashStr){ 
                if(err) throw err;
                _obj.password = hashStr;
                create( _obj, function(err, result, changes){fn(err, result, changes);} );

            });
            }
            else{
           //     console.log('USER ALREADY exist');
                fn('Fail to create user in create createProcedure', null, null);
            }
        });

    };

    self.DAILY_LIMIT = DAILY_LIMIT;
    //var TWENTY_FOUR = -1;
    self.TWENTY_FOUR =  TWENTY_FOUR;
    self.findById = findById;
    self.findOneByName = findOneByName;
    self.findAll = findAll;
    self.remove = remove;
    self.create = create;
    self.isUserExist = isUserExist;
    self.shouldResetDailyLimit = shouldResetDailyLimit;
    self.updateDailyLimitProcedure = updateDailyLimitProcedure;
    self.createProcedure = createProcedure;
    self.resetDailyLimit = resetDailyLimit;
    self.updateDailyLimit = updateDailyLimit;
    self.isBelowDailyLimit = isBelowDailyLimit;
    self.simpleIsBelowDailyLimit = simpleIsBelowDailyLimit;
    

 self.createUser = function (req, res, next) {
                var name = req.params.name, email = req.params.email, _password  = req.params.password ? req.params.password : '';

            
                createProcedure({name: name, email: email, likeArticles : [], likeComments: [], comments: [], dailyLimit: 0,followings: [], status: 'NEW', password: _password , desc: '', image: '', tags: [] }, function(err, result, changes) {
                        if (err) {
                                console.log(err);
                                return res.send({'error':err});
                        }
                        else {
                            return res.send({'result':result,'status':'successfully saved', 'changes': changes});
                        }
                });

                };
  self.findUserById = function(req, res, next) {

         var userId = req.params.userId;
         findById(userId, function(err, result){
                    if (err) {
                            console.log(err);
                         return res.send({'error':err});
                        }
                    else {
                       return res.send({'result':result,'status':'successfully saved'});
                    }

         });

    };



  self.findUserByName = function(req, res, next) {

         var name = req.params.name;
         findOneByName(name, function(err, result){
                    if (err) {
                        console.log(err);
                        return res.send({'error':err});
                        }
                    else {
                       return res.send({'result':result,'status':'successfully saved'});
                    }

         });

    };




 return self;
 }

module.exports = new userController();