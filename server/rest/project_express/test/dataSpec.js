var expect = require("chai").expect;
var should = require("chai").should();
var timeController = require("../controllers/timeController");
var articleController = require("../controllers/articleController");
var publishingController = require("../controllers/publishingController");
var userController = require("../controllers/userController");
var likeController = require("../controllers/likeController");
var restController = require("../controllers/restController");
var timeController = require("../controllers/timeController");
var validationController = require("../controllers/validationController");
var validating = require("../middleware/validating");
var logger = require("../helpers/logger.js");
var app = require("../app");
var promise = require("bluebird");
var bcrypt = promise.promisifyAll(require('bcrypt'));
//var sinon = require('sinon');
//var passThrough = require('stream').PassThrough;
//var httpApi = require("../test/testHttpApi");
//var superagent = require('superagent');
//superTest = superTest('http://localhost:8000');
var superTest = require('supertest')(app);
//superTest = superTest('http://localhost:8000');
// var port = process.env.PORT || (process.argv[2] || config.port || 3000);
// port = (typeof port === "number") ? port : 3000;

////////TO DO:
//1. Publishing.
//2. Test time
//3. Auto Produce Publishing by Time.
//4. Publishing Finder

 /**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function printPropNameAndValue(obj, functionName){

      for (var prop in obj){

              console.log(functionName + ' PROP: ' + prop + ' VALUE: ' + obj[prop]);
      }
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

describe("LOGGER |||", function(){
  describe("LOG.INFO ---", function(){

    logger().info('info log file');
  });
  describe("LOG.ERROR ---", function(){

    logger().error('error log file');
  });
  describe("LOG.WARN ---", function(){

    logger().warn('warining log file');
  });


});
describe("TIME |||", function(){

  describe("SERVER TIME ---", function(){


    var articleNumbers = 10;

    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });



       before( function(done){

        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }

     });



      it('search article by time range', function(done){

        var timeStamp = timeController.getCurrentPublishingTimeForVersion();

        expect(timeStamp).to.be.above(300);

        done();  
        
      });


      it('default time for publisher', function(done){
        var cTime = timeController.getCurrentTime();
        var pTime = timeController.getDateByHours(-10);
        var isCurrentTimeGreaterThanPTime = cTime > pTime;

        expect(isCurrentTimeGreaterThanPTime).to.be.equal(true);

         articleController.findArticlesByDateRange(pTime, cTime , function(err, result){

            expect(result.length).to.be.equal(articleNumbers);
            should.not.exist(err);
            should.exist(result);
           // console.log('Default time for publisher: ' + result);
            done();  

         });

        

        
        
      });

  });

});

describe("DATA |||", function(){

    var user = null;
    var article = null;
    var articleNumbers = 10;

   describe("ARTICLE SCHEMA ---", function(){
      var result = null;
      var parseResults = null;
      var articleSampleName = 'SAMPLE111';
      var articleTheEmail = articleSampleName + '@checking.com';

    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });


    before( function(done){

        publishingController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });


       before( function(done){

        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }

      


     });


       before(function(done){

             
          
            
              userController.create( {name: articleSampleName , email: articleTheEmail , status: 'NEW'} ,function(err, _result, changes){

            
                //var r = _result[0];
                //printPropNameAndValue( r, 'create user schema test');
               // printPropNameAndValue( changes, 'create user schema test');

                if (err) throw new Error("Fail to create");
                done(); 

              });


       });

        it("prevent duplicating user",  function(done){

          userController.createProcedure({name: articleSampleName , email: articleTheEmail , status: 'NEW'}, function(err, _result, changes){
            should.exist(err);
            done();
        });

      });


       it("prevent duplicating articles",  function(done){

        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;

            //{'error':err, 'status': false };
          //  console.log('BODY status: ' + res.body.status);

            var statusFalse = (res.body.status === false) ? true: false;
            expect(statusFalse).to.be.equal(true);

            if (num === (articleNumbers - 4)){
            //  console.log('prevent duplicating articles is calling done');
              done();
            }
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);      
          }

     });



     it("Article find all ", function(done){

          articleController.findAll(function(err, _result){

           result =  _result;
        
           if (result.length > 0){
              article = result[0];

             }

           expect(result.length).to.be.equal(articleNumbers);
            done();
          });

     });

   });

  /////end describe and begin describe

   describe("CREATE USER SCHEMA ---", function(){

      var numOfEntries = 1;

      before(function(done){

          var shouldDelete = true;
          if (shouldDelete){
                userController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");

                });
            }

            if (numOfEntries > 0 && shouldDelete){



             var sampleName = 'SAMPLE';
          
        
            userController.create( {name: sampleName , email: sampleName + '@checking.com' , status: 'NEW'} ,function(err, _result, changes){

        
                //var r = _result[0];
                //printPropNameAndValue( r, 'create user schema test');
               // printPropNameAndValue( changes, 'create user schema test');

                if (err) throw new Error("Fail to create");
                done(); 

              });

            }else{

              done();
            }


      });

   




            // before(function(done){
 
            // });

      it("find all users", function(done){

          userController.findAll(function(err, _result){

            if (err) throw new Error("Fail to remove or find all " + err);

            if (numOfEntries < 1){
              expect(_result.length).to.equal(numOfEntries, 'Error: should be empty');  
            }else{
              expect(_result.length).to.be.above( 0);  
            }
            
            done();
          });

      });

    });

/////end describe and begin describe

   describe("FIND ONE USER SCHMEA ---", function(){

      var numOfEntries = 1;
      var ranNum = 0;
      var user = null;
      before(function(done){
        

          userController.findAll(function(err, _result){
            if (err) throw new Error("Fail to find user" + err);

            if ( _result.length > 0) {

              //ranNum = getRandomArbitrary(0,_result.length);
              user = _result[0];

              //var userJSON = JSON.stringify(user);
              done();

            }else{

              done();
            }

          });
      });

        it("find user by id", function(done){

          userController.findById(user , function(err, result){
            if (err) throw new Error("Fail to find user" + err);

            expect(result).to.be.have.property('name');
            done();
          });
        });


        it("find user by name", function(done){

          userController.findOneByName(user.name, function(err, result){
            if (err) throw new Error("Fail to find user" + err);

            expect(result).to.be.have.property('name');
            done();
          });
        });


        it("validate existing user", function(done){

          userController.isUserExist( user.name, user.email , function(success, obj){

            //console.log('Existing user');
           // var userStr = 'existing user ' + JSON.stringify(obj);
           // console.log(userStr);
            expect(success).to.equal(true, 'user should be existed and result should be true');

            done();
          });

        });

        it("should update user daily limit", function(done){

          userController.shouldResetDailyLimit(user.id, function(success1){
            if (success1){
              userController.updateDailyLimitProcedure(user.id, function(success2){

                expect(success1).to.equal(success2, 'should update user');
                done();
              });

            }else{
            
              expect(user.dailyLimit).to.be.below(userController.DAILY_LIMIT , 'user daily limit should be below the dailyLimit quota');
              done();

            }


            
          });

        });

        it("check daily limit 1", function(done){

          userController.isBelowDailyLimit(user.id, function(isBelowLimit , dailyLimit){
              if (isBelowLimit){
              expect(userController.DAILY_LIMIT).to.be.above(  dailyLimit , 'user daily limit should be above the dailyLimit quota');   
              }else{
               expect(userController.DAILY_LIMIT).to.be.below(  dailyLimit , 'user daily limit should be below the dailyLimit quota');    
              }
            
            done();  
              
          });


        });

   });

/////end describe and begin describe

 describe("LIKE ---", function(){
  var likePositive = true;

      before(function(done){
        

          userController.findAll(function(err, _result){
            if (err) throw new Error("Fail to find user" + err);

            if ( _result.length > 0) {

              //ranNum = getRandomArbitrary(0,_result.length);
              user = _result[0];

              //var userJSON = JSON.stringify(user);
              done();

            }else{

              done();
            }

          });
      });

  before(function(done){ 
    



    likeController.remove( 'ALL' , function(err, succeed){

      if(err) throw new Error('Error: ' + err);

      if (succeed){
       done(); 
      }

    });

  });



before(function(done){
        likeController.createLikeProcedure(user.id, article.url, likePositive, function(succeed){

              //if(err) throw new Error('Error: ' + err);
              if(succeed){

               // console.log(JSON.stringify(doc));
            //    console.log('created like');
              } 
              done();          
        });
});



 it('did like article test', function(done){





    likeController.find({}, function(err, doc){
        
            if(doc){
               // console.log(JSON.stringify(doc));
              }
       expect(doc.length).to.equal(1, 'expect finding equal to ' + 1);
        done();
    });
  });


  it('did like article test', function(done){



    likeController.didLikeArticles(user.id, article.url, likePositive, function(succeed, likeObj){
      
      expect(likeObj).to.be.a('array', 'expect to be an array');

        if (likeObj.length > 0){
          var lo = likeObj[0];
        //  console.log('like obj: ' + JSON.stringify(lo));
        //  console.log('like obj: ' + lo.userId);
          should.exist(lo.userId);
        }
        expect(succeed).to.equal(true, 'expect finding the article');

        done();
    });

  });


  it('did like article test', function(done){

    likeController.didLikeArticles(user.id, article.url, !likePositive, function(succeed, likeObj){
        expect(succeed).to.equal(false, 'expect finding the article');
        done();
    });

  });



  it('find like article test 1', function(done){
    likeController.find({'userId': user.id, 'articleUrl': article.url, positive: likePositive}, function(err, likeObj){

        if (likeObj.length > 0){
            var likeO = likeObj[0];
            should.exist(likeO.userId);
            done();
        }
        
    });
  });

  it('find like article test - reverse 2', function(done){
    likeController.find({'userId': user.id, 'articleUrl': article.url, positive: !likePositive}, function(err, likeObj){

        var obj = likeObj[0];
        should.not.exist(obj);
        done();
      });
    });

    it('find like article test 3', function(done){

      likeController.findByArticleUrl(article.url, function(err, likeObj){
      
        if (likeObj.length > 0){
            var likeO = likeObj[0];
            should.exist(likeO.userId);
            done();
        }

      });

    });


    it('find like article test 4', function(done){

      likeController.findByUserId(user.id, function(err, likeObj){
      
        if (likeObj.length > 0){
                   var likeO = likeObj[0];
            should.exist(likeO.userId);
            done();
        }

      });

    });

   it('find like article test 4', function(done){

      likeController.findByUserId('randomId', function(err, likeObj){
        expect(likeObj.length).to.be.equal(0, 'should be zero');
        done();
      });

    });



    it('find like article test 5', function(done){

      likeController.findByUserIdAndArticleUrl(user.id, article.url, function(err, likeObj){
      
        if (likeObj.length > 0){
            var likeO = likeObj[0];
            should.exist(likeO.userId);
            done();
        }

      });

    });

    it('confirm user increment daily limit', function(done){

      userController.findById(user.id, function(err, obj){
       // console.log('increment number: ' + obj.dailyLimit);
        expect(obj.dailyLimit).to.be.above(0, 'should be greater than zero');
        done();
      });

    });

 });

/////end describe and begin describe

 describe("PUBLISHING 1 ---", function(){
      var result = null;
      var parseResults = null;
        before(function(done){

          articleController.findAll(function(err, _result){

            result = _result;
            done();

          });

        });

       it("parse array of articles into publishing", function(done){      
                
           expect(result.length).to.be.above(0, "result shouldn't be 0");
                      
            var leng = result.length;
//            console.log('about to call find all and article size is ' + leng);

              var AddedPublishing = 0;
             for (var i = 0; i < leng; i++) {
                var article = result[i];
                AddedPublishing++;

             }

            var warning = "Number shouldn't be "  + leng  + "  while AddedPublishing is " + AddedPublishing;
            expect(leng).to.deep.equal(AddedPublishing, warning);

                       
                      



           done();
          
            
            
           
       });

    var createPublishingErr = null;
    var createPublishingSuccess = null;

    before(function(done){

      publishingController.remove('ALL', function(err, succeed){

        expect(err).to.be.equal(null);
        expect(succeed).to.be.equal(true);

        done();
      });

    });
  before(function(done){
                        publishingController.parseArticles(result, function(results){

                              results.status = "OK";
                              parseResults = results;
                           //    var jsonResult = JSON.stringify(results);

                              if (!false){


                                  publishingController.createPublishing(results, function(err, succeed){
                                        should.not.exist(err);
                                        if (succeed){
                                          //console.log('Publishing SAVED! ' + err );  
                                        }else{

                                          //console.log('Publishing FAILED!' + err);
                                        }

                                        createPublishingErr = err;
                                        createPublishingSuccess = succeed;
                                       done();

                                       }
                                      );
                                }

                              });
                      
                         });

 it("create Publishing record", function(done){
           expect(createPublishingErr).to.deep.equal(null, "result should be null: " + createPublishingErr);
           expect(createPublishingSuccess).to.deep.equal(true, "result should be true");
           done();
 });

 var _afterPubLeng = -1;
 var afterPubResults = null;

 before(function(done){
         publishingController.findAll(function(err, _afterPubResults){

                  afterPubResults = _afterPubResults;
                  _afterPubLeng = _afterPubResults.length;
                 // console.log('TOTAL publishing ' + _afterPubLeng + ' err ' + err);

                 done(); 
                                   
                 });

 });


	it("check publishing findall", function(done){
      
    expect(_afterPubLeng).to.equal(Number(afterPubResults.length), "should equal to zero");
    done();


   });


  var _afterPubLeng_2 = -1;

    before(function(done){

              publishingController.remove('ALL', function(err, succeed){

                                              publishingController.findAll(function(err, afterPubResults){

                                                    _afterPubLeng_2 = Number(afterPubResults.length);
                    //                                  console.log('Final after deletion: ' + _afterPubLeng_2 + ' ' + err);
                                                      done();
                                              });
              });

             
    });

    it("check publishing delete all", function(done){

      expect(_afterPubLeng_2).to.equal(Number(0), "should equal to zero but got: " + _afterPubLeng_2);

      done();
     });

   });

describe("PUBLISHING 2 ---", function(){
      var result = null;
      before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });



       before( function(done){

        var articlesNumbers = 40;
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });


      before(function(done) {
         articleController.findAll(function(err, _result){

           result =  _result;
           if (result.length > 0){
              article = result[result.length - 1];
           }

           articles = _result;

           done();
          });
       });


    before(function(done){

      publishingController.remove('ALL', function(err, succeed){

        expect(err).to.be.equal(null);
        expect(succeed).to.be.equal(true);

        done();
      });

    });
  before(function(done){

        publishingController.parseArticles(result, function(results){

              results.status = "OK";
              parseResults = results;
           //    var jsonResult = JSON.stringify(results);

                  publishingController.createPublishing(results, function(err, succeed){
                        should.not.exist(err);
                        if (succeed){
                          //console.log('Publishing SAVED! ' + err );  
                          done();
                        }
                       }
                      );
              });
      
        });

   it('save and find all', function(done){

    publishingController.findAll(function(err, results){
      should.not.exist(err);
      expect(results.length).to.be.equal(1);
      var publishRecord = results[results.length - 1];
      expect(publishRecord.status).to.be.equal('OK');
      done();

    });

   });

   it('create publishing', function(done){

    publishingController.createPublishingProcedure( result, function(pub){
      
      should.exist(pub);
     // expect(succeed).to.be.equal(true);
      done();

    });
   });

      it('save and find all 2', function(done){

    publishingController.findAll(function(err, results){
      should.not.exist(err);
      expect(results.length).to.be.equal(2);
      var publishRecord = results[results.length - 1 ];
      expect(publishRecord.status).to.be.equal('OK');
      done();

    });

   });

});


/////end describe and begin describe

describe("SECURITY 1 ---", function(){

  var hashPassword = '';
  var sampleName = 'SAMPLE2';
  var theEmail = sampleName + '@checking.com';
  var user1 = {};
  var thePassword = 'THISPAWWSRD';
  var token = '';

  //comparePassword = function (password, hash, callBack){
    before(function(done){
    validationController.generateHash(thePassword, function(err, hashStr){
      hashPassword = hashStr;

        userController.create( {name: sampleName , email: theEmail , status: 'NEW', password: hashPassword} ,function(err, _result){

            if (err) throw new Error("Fail to create");

            user1 = _result;
            // console.log('USERID: ' + user1.id);

            validating().accessTokenFactoryFunc(user1, null, function(_token){
              token = _token;

              done(); 
            });
          });
      //done();
      });
    });

  it("validating token test 1", function(done){

    //console.log('Token ' + token);

    validating().verifyTokenFunc(token, function(err, decoded){

      console.log(decoded);
      console.log(err);

      should.not.exist(err);
      should.exist(decoded);
      done();
    });
    
  });



  it("validating password test 1", function(done){

    userController.findById(user1.id, function(err, result){

      expect(result.password).to.be.equal(hashPassword, "password should be equal 1");
      expect(result.password).to.be.equal(user1.password, "password should be equal 2");
      done();

    });
  });

    it("validating password test 2", function(done){
//      console.log('user.password: ' + user.password  + ' hashPassword: ' + hashPassword);
        validationController.comparePassword(thePassword ,user1.password, function(err, isMatch){
          expect(isMatch).to.be.equal(true);
          done();
      });

  });  



  it("hashing password test", function(done){
    validationController.generateHash(thePassword, function(err, hashStr){
      expect(hashStr.length).to.be.above(8);
      done();
    });

  }); 

  it("compare password test", function(done){
    validationController.comparePassword(thePassword, hashPassword, function(err, isMatch){
      expect(isMatch).to.be.equal(true);
      done();
      });
  });    

  it("compare password test", function(done){
    validationController.comparePassword('fdfd', hashPassword, function(err, isMatch){
      expect(isMatch).to.be.equal(false);
      done();
     });
    });


    it("validating user test 1", function(done){

        validating().isUserAuthorizedFunc(user1.email, thePassword, null, function(err, isMatch, theUser){
          expect(isMatch).to.be.equal(true);
            done();
          } );
      });



    it("validating user token test 2.1", function(done){
        validating().isUserAuthorizedFunc(user1.email, null, '' , function(err, isMatch, theUser){
          expect(isMatch).to.be.equal(false);
          done();
            } );
      });

        it("validating user token test 2.2", function(done){
        validating().isUserAuthorizedFunc(user1.email, null, null, function(err, isMatch, theUser){
          expect(isMatch).to.be.equal(false);
          done();
            } );
      });


    it("validating user test 3", function(done){
        validating().isUserAuthorizedFunc(user1.email, 'wrong password', null, function(err, isMatch, theUser){
          expect(isMatch).to.be.equal(false);
          done();
            } );
      });


    it("update user token test 1", function(done){
//produceAccessTokenProcedure(userEmail, password, oldToken, expirationTime, callBack)
      validating().produceAccessTokenFullProcedureFunc(user1.email, thePassword, null, null, function(err, token, succeed){
        //should.not.exist();
        //should.not.exist(user1.email);

        if (succeed) {
         // console.log('PASS Token ' + token);
         should.exist(token);
         //done();
        }
        else {
          should.not.exist(token);
         // console.log('FAIL Token ' + err);
         
        }
        done();

      });
    });


   it('validating token test 2', function(done){

    validating().produceTokenForUserFunc(user1, null , function(token){
        expect(token.length).to.be.above(4);
        done();
    });
   });

    // it("sanitize user test", function(){

    //   validating().sanitizeUserFunc(user1).then(function(result){
    //     should.not.exist(user1.password);
    //     should.not.exist(user1.email);
    //     should.exist(user.name);
    //   });

    // });

    });


/////end describe and begin describe

  describe("SECURITY 2", function(){

  var hashPassword = '';
  var sampleName = 'SAMPLE3';
  var theEmail = sampleName + '@checking.com';
  var user1 = {};
  var thePassword = 'THISPAWWSRD';
  var token = '';
  //comparePassword = function (password, hash, callBack){
  before(function(done){
    validationController.generateHash(thePassword, function(err, hashStr){
      hashPassword = hashStr;

        userController.create( {name: sampleName , email: theEmail , status: 'NEW', password: hashPassword} ,function(err, _result){

            if (err) throw new Error("Fail to create");

            user1 = _result;
        //    console.log('USERID: ' + user1.id + ' TOKEN: ' + user1.token);
            done();

      // validating().sanitizeUserFunc(user1).then(function(result){
      //         validating().accessTokenFactoryFunc(result, null, function(_token){
      //           token = _token;
      //           done(); 
      //         });
      //       });

          });
      //done();
      });
    });


  before(function(done){
//produceAccessTokenProcedure(userEmail, password, oldToken, expirationTime, callBack)
  validating().produceAccessTokenFullProcedureFunc(user1.email, thePassword, null, null, function(err, _token, succeed){

        if (succeed) {
        ///  console.log('PASS Token 1: ' + _token);
         //should.exist( _token);
          token = _token;
           
         }
        else {
        //  console.log('FAIL Token 1.0: ' + err + ' token: ' + _token);
          //token = "";
        }
        done();

      });
    });


//findById


  it("validating token test 1.2", function(done){

    //console.log('Token ' + token);
    validating().verifyTokenFunc(token, function(err, decoded){

     // console.log('decoded ' + decoded);
     // console.log('err' + err);
     
      if (token && token.length > 0){


          // for (var prop in decoded){
          //     console.log('PROP ' + prop + ' :' + decoded[prop]);
          //   }

         should.not.exist(err);
        should.exist(decoded);  
      }else{
         should.exist(err);
        should.not.exist(decoded);
      }
      
      done();
    });
  });


  it("validating token test 1.3", function(done){

    //console.log('Token ' + token);

    userController.findById(user1.id , function(err, result){
          if (err) throw new Error("Fail to find user" + err);

            expect(result).to.be.have.property('name');
            should.exist(result.token);
            expect(result.token).to.be.equal(token);
            expect(result.token.length).to.be.above(5);
            done();
      });
  });

  it("validating token test 1.4", function(done){

    //console.log('Token ' + token);
    if(user1.token && user1.token > 0){

      validating().verifyTokenFunc(user1.token, function(err, decoded){

      should.not.exist(err);
      should.exist(decoded);  
      expect(decoded).to.be.have.property('_id');
      done();
    });

    }else{

      done();
    }
    
  });




  });


});



/////end SECTIONAL describe and begin SECTIONAL describe


describe("HTTP |||", function(){


   describe("LIKE ---", function(){
      var hashPassword = '';
      var sampleName = 'SAMPLE3';
      var theEmail = sampleName + '@checking.com';
      var thePassword = 'THISPAWWSRD';
      var token = '';

      var user = null;
      var article = null;
      var articles = null;
      // before(function(done) {
      //   //superTest(app);
      //   done();
      // });

      // beforeEach(function() {
      //   this.request = sinon.stub(http, 'request');
      // });

      before(function(done) {
         articleController.findAll(function(err, _result){

           result =  _result;
           if (result.length > 0){
              article = result[result.length - 1];
           }

           articles = _result;

           done();
          });
       });

      before(function(done) {

           validating().produceAccessTokenFullProcedureFunc( theEmail, thePassword, null, null, function(err, _token, succeed){

            //  should.not.exist(err);
            //  expect(succeed).is.equal.to(true);
              token = _token;
              done();

           });   
          });

      before(function(done){

       superTest.put('/createLike').send({ likePositive: true, token: token, articleUrl : article.url }).expect(200).end(function(err, res){
            if (err) throw err;
            expect(res.body.result.command.length).to.be.above(2);
            done(); 
        });

      });
  

  it('get article', function(done) {

       superTest.get('/getArticles').expect(200).end(function(err, res){
            if (err) throw err;
            expect(res).to.be.not.have.property('body.error.message');
            expect(res.body.result.data.length).to.be.above(0);
            done(); 
        });
     });

  it('create like 1', function(done) {

         // var token = req.params.token, 
         // articleId = req.params.articleId,
         // isLikePositive = req.params.likePositive,

       superTest.put('/createLike').send({ likePositive: true, token: token, articleUrl : article.url }).expect(200).end(function(err, res){
            if (err) throw err;
            //expect(res).to.be.not.have.property('body.error.message');
             //expect(res).to.have.property('body.result');
             //expect(res).to.have.property('body.result.command');
           //  console.log('res.body.result.command ' + res.body.result.command);

            //console.log('create like command: ' + res.body.result.command);
            expect(res.body.result.command.length).to.be.above(2);

            expect(res.body.result.command).to.be.equal('Already done');


            

            done(); 
        });

     });

  it('create like 2', function(done) {

         // var token = req.params.token, 
         // articleId = req.params.articleId,
         // isLikePositive = req.params.likePositive,
         var firstArticle = articles.filter(function(value){
          return value.url !== article.url;
         })[0];

       superTest.put('/createLike').send({ likePositive: true, token: token, articleUrl : firstArticle.url }).expect(200).end(function(err, res){
            if (err) throw err;
            //expect(res).to.be.not.have.property('body.error.message');
             //expect(res).to.have.property('body.result');
             //expect(res).to.have.property('body.result.command');
         //    console.log('res.body.result.command ' + res.body.result.command);

            //console.log('create like command: ' + res.body.result.command);
            expect(res.body.result.command.length).to.be.above(2);

            expect(res.body.result.command).to.be.equal('Like created');

            done(); 
        });

     });


  it('create like 3', function(done) {

         // var token = req.params.token, 
         // articleId = req.params.articleId,
         // isLikePositive = req.params.likePositive,

       superTest.put('/createLike').send({ likePositive: false, token: token, articleUrl : article.url }).expect(200).end(function(err, res){
            if (err) throw err;
            //expect(res).to.be.not.have.property('body.error.message');
             //expect(res).to.have.property('body.result');
             //expect(res).to.have.property('body.result.command');
            // console.log('res.body.result.command ' + res.body.result.command);

            //console.log('create like command: ' + res.body.result.command);
            expect(res.body.result.command.length).to.be.above(2);

            //expect(res.body.result.command).to.be.equal('fail to create like');


            

            done(); 
        });

     });


    });

/////end describe and begin describe

  describe("USER ---", function(){
      
      var sampleName = 'SAMPLE4';
      var theEmail = sampleName + '@checkingmail.com';
      var thePassword = 'THISPAWWSRDMABEd';
      var token = '';

      var user = null;
      var article = null;
      var articles = null;
      before(function(done) {
            userController.remove('ALL', function(err, succeed){

              if (!succeed) throw new Error("Fail to remove");
              done();
            });
       });

      before(function(done) {

           superTest.put('/createUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                if (err) throw err;
                expect(res.body.result.data.length).to.be.above(20);
                done(); 
            });
         });

      it('user already existed', function(done) {

           superTest.put('/createUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                //if (err) throw err;
                
                expect(res.body.status).to.be.equal(false);
                //should.exist(res.body.t);
                done(); 
            });

         });


       it('login user 1', function(done) {

           superTest.put('/loginUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                //if (err) throw err;
               // printPropNameAndValue(result , 'login user');
                expect(res.body.result.data.length).to.be.above(20);
                token = res.body.result.data;
                done(); 
            });

         });



       it('invalid login user 2', function(done) {

           superTest.put('/loginUser').send({ email: 'fake@mail.com', password: 'fakePassword'}).expect(200).end(function(err, res){
                //if (err) throw err;
               // printPropNameAndValue(result , 'login user');
               should.not.exist(res.body.result.data);
                //expect(res.body.result.data.length).to.be.above(20);
                expect(res.body.status).to.be.equal(false);
                //token = res.body.result.data;
                done(); 
            });

         });


       it('repeating like one article', function(done) {

        // if (token.length > 10){
          
          validating().verifyTokenFunc(token, function(err, decoded){
            should.not.exist(err);
            should.exist(decoded);
           
            done();
           });

        

      });



       it('repeating likes user 49', function(done) {

        // if (token.length > 10){

          validating().verifyTokenFunc(token, function(err, decoded){
            should.not.exist(err);
            should.exist(decoded);
           
            done();
           });

        

      });

    it('repeating likes user 50', function(done) {

         if (token.length > 10){

          validating().verifyTokenFunc(token, function(err, decoded){
            should.not.exist(err);
            should.exist(decoded);
           
            done();
           });

        }

      });


    });

/////end describe and begin describe

  describe("DAILY LIMIT ---", function(){
      
      var sampleName = 'SAMPLE4';
      var theEmail = sampleName + '@checkingmail.com';
      var thePassword = 'THISPAWWSRDMABEd';
      var token = '';
      var articleNumbers = 50;

      var user = null;
      var articles = null;
      before(function(done) {
            userController.remove('ALL', function(err, succeed){

              if (!succeed) throw new Error("Fail to remove");
              done();
            });
       });

      before(function(done) {

           superTest.put('/createUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                if (err) throw err;
                expect(res.body.result.data.length).to.be.above(20);
                token = res.body.result.data;

                 validating().verifyTokenFunc(token, function(err, decoded){
                    user = decoded;

                    done();
              });
                //done(); 
            });
         });

    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });



       before( function(done){

        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

      before( function(done){
      
       articleController.findAll(function(err, _result){
        articles = _result;
        done();
       });

     });



      it('within daily allowance 1', function(done){

        userController.isBelowDailyLimit(user._id, function(isBelow,obj){
             expect(isBelow).to.be.equal(true);
             should.exist(obj);
             done();
        });

      });
      it('49 likes all articles', function(done){


        var likeArticleFunc = function(num, article, allowNum){

           superTest.put('/createLike').send({ likePositive: true, token: token, articleUrl : article.url }).expect(200).end(function(err, res){
              should.not.exist(err);
              should.not.exist(res.body.error);
              should.exist(res.body.result);
              expect(res.body.result.command).to.be.equal('Like created');

              if (num === (allowNum - 1)){done();}
            });
          };

        var allowNum = 49;
         for (i = 0 ; i < allowNum ; i++){

            var art = articles[i];
            likeArticleFunc(i, art, allowNum);
             
          }

     });


      it('within daily allowance 2', function(done){

        userController.isBelowDailyLimit(user._id, function(isBelow,obj){
         
             expect(isBelow).to.be.equal(true);
             should.exist(obj);
             done();
        });

      });

    });

/////end describe and begin describe

  describe("UPDATING USER 1 ---", function(){
      
      var sampleName = 'SAMPLE4';
      var theEmail = sampleName + '@checkingmail.com';
      var thePassword = 'THISPAWWSRDMABEd';
      var token = '';
      var articleNumbers = 20;

      var user = null;
      var articles = null;
      before(function(done) {
            userController.remove('ALL', function(err, succeed){

              if (!succeed) throw new Error("Fail to remove");
              done();
            });
       });

      before(function(done) {

           superTest.put('/createUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                if (err) throw err;
                expect(res.body.result.data.length).to.be.above(20);
                token = res.body.result.data;

                 validating().verifyTokenFunc(token, function(err, decoded){
                    user = decoded;

                    done();
              });
                //done(); 
            });
     });



    before(function(done){

        userController.updateDailyLimit(user._id, 100, function(succeed,obj){
          
             expect(succeed).to.be.equal(true);
          
             done();
        });

    });




      it('updating daily allowance 0', function(done){

        userController.isBelowDailyLimit(user._id, function(isBelow,dailyLimit){
          
             expect(isBelow).to.be.equal(false);
             should.exist(dailyLimit);
             done();
        });

      });



    });

/////end describe and begin describe

  describe("UPDATING USER 2 ---", function(){
      
      var sampleName = 'SAMPLE7';
      var theEmail = sampleName + '@checkingmail.com';
      var thePassword = 'THISPAWWSRDMABEd';
      var token = '';
      var articleNumbers = 20;

      var user = null;
      var articles = null;
      before(function(done) {
            userController.remove('ALL', function(err, succeed){

              if (!succeed) throw new Error("Fail to remove");
              done();
            });
       });

      before(function(done) {

           superTest.put('/createUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                if (err) throw err;
                expect(res.body.result.data.length).to.be.above(20);
                token = res.body.result.data;

                 validating().verifyTokenFunc(token, function(err, decoded){
                    user = decoded;

                    done();
              });
                //done(); 
            });
     });

    before(function(done){

        userController.updateDailyLimit(user._id, 100, function(succeed,obj){
            console.log('updateDailyLimit Daily Limit. ');

            if(succeed)done();
        });

    });

    // before(function(done){

    //   var testLimit = 10;
    //   var testFunc = function(userId, num){ userController.updateDailyLimitProcedure(userId, function(succeed){


    //       if (num === (testLimit -1)){
    //         done();
    //       }
    //      });
    // };
      
    //   for (i = 0; i < testLimit; i++){
       
    //      testFunc(user._id, i);
    //   }
        

    // });




      it('updating daily allowance 1', function(done){

        userController.isBelowDailyLimit(user._id, function(isBelow,dailyLimit){
         
             expect(isBelow).to.be.equal(false);
             done();
        });

      });



    });

/////end describe and begin describe
 describe("UPDATE DAILY LIMIT PROCEDURE 1 ---", function(){
      
      var sampleName = 'SAMPLE77';
      var theEmail = sampleName + '@checkingmail.com';
      var thePassword = 'THISPAWWSRDMABEd';
      var token = '';
      var articleCounter = 0;

      var user = null;
      var articles = null;
      var baseUserDailyActivity = 44;
      var accumulatedUserActivitues = baseUserDailyActivity;
    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

      before( function(done){
        var articleNumbers = 20;
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });


      before(function(done) {
            userController.remove('ALL', function(err, succeed){

              if (!succeed) throw new Error("Fail to remove");
              done();
            });
       });

      before(function(done) {

           superTest.put('/createUser').send({ email: theEmail, password: thePassword}).expect(200).end(function(err, res){
                if (err) throw err;
                expect(res.body.result.data.length).to.be.above(20);
                token = res.body.result.data;

                 validating().verifyTokenFunc(token, function(err, decoded){
                    user = decoded;

                    done();
              });
                //done(); 
            });
     });

    before(function(done){

        userController.updateDailyLimit(user._id, baseUserDailyActivity, function(succeed,obj){
          
            accumulatedUserActivitues++;
            if(succeed)done();
        });

    });

    before(function(done){

        userController.updateDailyLimitProcedure(user._id, function(succeed,obj){
          
              accumulatedUserActivitues++;
             done();
        });

    });

  before(function(done) {
         articleController.findAll(function(err, _result){

           result =  _result;
           if (result.length > 0){
              article = result[result.length - 1];
           }

           articles = _result;

           done();
          });
      });


    before(function(done){

        userController.updateDailyLimitProcedure(user._id, function(succeed,obj){
         
            accumulatedUserActivitues++;
             done();
        });

    });
    before(function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: token, articleId : art._id }).expect(200).end(function(err, res){
            
            
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
            });

    });

    before(function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: token, articleId : art._id }).expect(200).end(function(err, res){
            
            
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
            });

    });

    before(function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: token, articleId : art._id }).expect(200).end(function(err, res){
            
            
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
            });

    }); 
    
        before(function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: token, articleId : art._id }).expect(200).end(function(err, res){
            
            
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
            });

    }); 



                            

      it('updating daily allowance 1', function(done){

        userController.isBelowDailyLimit(user._id, function(isBelow,dailyLimit){
           
            var testCount = accumulatedUserActivitues - 1;
            expect(isBelow).to.be.equal(userController.simpleIsBelowDailyLimit(testCount));
            expect(isBelow).to.be.equal(userController.simpleIsBelowDailyLimit(dailyLimit));
             expect(dailyLimit).to.be.equal(testCount);
             done();
        });

      }); 

    it('create like when over limit 1',function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: token, articleId : art._id }).expect(200).end(function(err, res){
          
          expect(res.body.status).to.be.equal(false);
        //  console.log('res.body.result.command: ' + res.body.result.command);
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
         });

    }); 
    it('create like when over limit 2',function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: token, articleId : art._id }).expect(200).end(function(err, res){
          
          expect(res.body.status).to.be.equal(false);
        //  console.log('res.body.result.command: ' + res.body.result.command);
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
         });

    }); 

          it('updating daily allowance 2', function(done){

        userController.isBelowDailyLimit(user._id, function(isBelow,dailyLimit){
          //  console.log('Daily Limit.. ' + dailyLimit + ' isBelow: ' + isBelow);
            var testCount = accumulatedUserActivitues - 1;
            expect(isBelow).to.be.equal(userController.simpleIsBelowDailyLimit(testCount));
            expect(isBelow).to.be.equal(userController.simpleIsBelowDailyLimit(dailyLimit));
             expect(dailyLimit).to.be.equal(testCount);
             done();
        });

      });

      it('invalidated token 1',function(done){
        var art = articles[articleCounter++];
        superTest.put('/createLike').send({ likePositive: true, token: 'reandomwtoekn', articleId : art._id }).expect(200).end(function(err, res){
          
          expect(res.body.status).to.be.equal(false);
       //   console.log('res.body.result.command: ' + res.body.result.command);
          if(res.body.status)accumulatedUserActivitues++;
          done();
        
         });

    });





});


/////end describe and begin describe
 describe("PUBLISING VERSION 1 ---", function(){

    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

      before( function(done){
        var articleNumbers = 10;
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

    before(function(done){

        publishingController.remove('ALL', function(err, succeed){

          done();

      });
      
    });


    it('getCurrentPublishing simple 1',function(done){
          var _ver = timeController.getCurrentPublishingTimeForVersion();
          expect(_ver).to.be.above(100);
        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){
          
          should.not.exist(err);
        //  console.log('COMMAND getCurrentPublishing : ' + res.body.result.command);
      //    console.log('COMMAND getCurrentPublishing : ' + res.body.result.data);


//          console.log('ERROR getCurrentPublishing : ' + err);
  //        console.log('ERROR getCurrentPublishing : ' + res.body.error);

          expect(res.body.status).to.be.equal(true);


         // console.log('res.body.result.command: ' + res.body.result.command);

          done();
          
         });
    }); 



 });

describe("PUBLISING VERSION 2 ---", function(){

  var result = null;
  before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

      before( function(done){
        var articleNumbers = 10;
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

    before(function(done){

        publishingController.remove('ALL', function(err, succeed){

          done();

      });
      
    });

  before(function(done) {
         articleController.findAll(function(err, _result){

           result =  _result;


           done();
          });
      });


   it('createPublishingProcedure 1',function(done){

      expect(result.length).to.be.above(1);
      publishingController.createPublishingProcedure(result, function(unCleanPub){


        //expect(succeed).to.be.equal(true);

        should.exist(unCleanPub);
        should.exist(unCleanPub.titles);
        expect(unCleanPub.titles.length).to.be.equal(result.length);
        expect(unCleanPub.titles.length).to.be.equal(unCleanPub.urls.length);
        //console.log('unCleanPub '+ unCleanPub);
        done();

      });

   

   });


   after(function(done){

    restController.clearPublisher();
    done();
   });


});


/////end describe and begin describe
 describe("PUBLISING VERSION 3 ---", function(){
    var articleNumbers = 10;
    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

      before( function(done){
        
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

    before(function(done){

        publishingController.remove('ALL', function(err, succeed){

          done();

      });
      
    });


    before(function(done){
          var _ver = timeController.getCurrentPublishingTimeForVersion();
          expect(_ver).to.be.above(100);
        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){

          done();
          
         });
    });


    it('getCurrentPublishing cache 1',function(done){
          var _ver = timeController.getCurrentPublishingTimeForVersion();
          expect(_ver).to.be.above(100);
        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){
          
          should.not.exist(err);
          should.exist(res.body.result.data);
          should.exist(res.body.result.data.titles);
          expect(res.body.result.data.titles.length).to.be.above(0);
          expect(res.body.status).to.be.equal(true);


         //console.log('res.body.result.command: ' + res.body.result.command);

          done();
          
         });
    }); 


      after( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

     after(function(done){

        publishingController.remove('ALL', function(err, succeed){

          done();

      });


      
    });

    after(function(done){

          restController.clearPublisher();
          done();

      });

 });


describe("PUBLISING VERSION 4 ---", function(){
    var articleNumbers = 10;

      before( function(done){
        
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });



    it('getCurrentPublishing with randomNumber cache 2', function(done){


          //var _ver = randomIntFromInterval(-100, 100);
          var _ver = timeController.getCurrentPublishingTimeForVersion();
        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){
          should.not.exist(err);
          should.exist(res.body.result.data);
          should.exist(res.body.result.data.titles);
         // expect(res.body.result.data.titles.length).to.be.equal(articleNumbers);
          expect(res.body.status).to.be.equal(true);
          done();
          });
         
      });



       after( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

     after(function(done){

        publishingController.remove('ALL', function(err, succeed){

          done();
          restController.clearPublisher();
      });

      });


     after(function(done){

          restController.clearPublisher();
          done();

      });

   });

describe("PUBLISING VERSION 5 ---", function(){
    var articleNumbers = 10;

      before( function(done){
        
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

      before( function(done){
        
        var createArticleFunc = function(num){
            var reverseTime = getRandomArbitrary(-1000000, -100);
            var _reverseTime = timeController.getDateByHours(reverseTime)

             superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'backURLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor', timeStamp: _reverseTime }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });


      before( function(done){
        
        var createArticleFunc = function(num){
            var reverseTime = getRandomArbitrary(-100000, 101000);
            var _reverseTime = timeController.getDateByHours(reverseTime)

             superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'backbackURLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor', timeStamp: _reverseTime }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });


    it('getCurrentPublishing check most currentTime and most current version', function(done){
          
          // var _ver = randomIntFromInterval(10000, 10000000);
          var time = timeController.getCurrentTime();
          var _ver = timeController.getCurrentPublishingTimeForVersion(time);


        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){

          console.log('version: ' + _ver);
          should.not.exist(err);
          should.exist(res.body.result.data);
          should.exist(res.body.result.data.titles);
          expect(res.body.result.data.titles.length).to.be.above(0);
          expect(res.body.status).to.be.equal(true);

          done();
          
         });
      });


        it('getCurrentPublishing check most currentTime and most current version 1', function(done){
          
          // var _ver = randomIntFromInterval(10000, 10000000);
         // var time = timeController.getCurrentTime();
          var _ver = timeController.getCurrentPublishingTimeForVersion();


        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){

          console.log('version: ' + _ver);
          should.not.exist(err);
          should.exist(res.body.result.data);
          should.exist(res.body.result.data.titles);
          expect(res.body.result.data.titles.length).to.be.above(0);
          expect(res.body.status).to.be.equal(true);

          done();
          
         });
      });



       after( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });

     after(function(done){

        publishingController.remove('ALL', function(err, succeed){

          done();

      });

      });

    after(function(done){

          restController.clearPublisher();
          done();

      });


   });

  describe("increaes like for Article 1 ---", function(){
      var articleNumbers = 5;
          //updateArticleLikeProcedure
      var articleUrl = null;
      var _isLike = new Date().getMilliseconds() % 2 ? false: true;
      var article = null;

      before( function(done){
        
        var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
        });};

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

  before(function(done){
          var _ver = timeController.getCurrentPublishingTimeForVersion();
        superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){


             articleUrl = res.body.result.data.urls[0] ;

             if(!articleUrl || err) throw new Error('article URL cant be emptied');

            done();
          
         });
      });




      before(function(done){

             articleController.findByUrl(articleUrl, function(err, result){

               if(!articleUrl || err || !result) throw new Error('article URL cant be emptied with err ' + err);
                article = result;
                done();

             });     
       });




      before(function(done){

      if(!articleUrl) throw new Error('article url cant be nil: ' + articleUrl);

        superTest.put('/updateArticleLikeProcedure').send({ url: articleUrl, isLike: _isLike }).expect(200).end(function(err, res){
          if(err){

            throw new Error(err);
          }else{

          done();  
          }
          
          
         });

    });

    it('confirm like has been updated', function(done){

              console.log('article url:  ' + articleUrl);
               done();

             articleController.findByUrl(articleUrl, function(err, result){

               if(!articleUrl || err || !result) throw new Error('article URL cant be emptied with err ' + err);
                
                if (_isLike){
                  expect(result.likes).is.to.be.above(article.likes);
                }else{
                  expect(result.likes).is.to.be.below(article.likes);
                }
                
               

            });
      });


    after( function(){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  //done();
                });

      });

    after( function(){

        publishingController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  //done();
                });

      });

  });


  describe("PUBLISHING VERSION ---", function(){
      var articleNumbers = 200;
          //updateArticleLikeProcedure
      var articleUrl = null;
      var _isLike = new Date().getMilliseconds() % 2 ? false: true;
      var article = null;
      var createDate = null;
      var testVer = null;
      function getHours(max, min){

        return Math.floor(Math.random() * (max - min + 1)) + min;
      }


    before( function(done){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove");
                  done();
                });

      });


      before( function(done){
        
        var createArticleFunc = function(num){

          if (true){
              var hours = getHours(0, -100);
             var date = timeController.getDateByHours(hours);

               if(!createDate){
                 createDate = date; 
                 testVer = timeController.getCurrentPublishingTimeForVersion(createDate);

               }
             
             var ver = timeController.getCurrentPublishingTimeForVersion(createDate);

             console.log('publishing veration createArticle createDate: ' + ver);
             console.log('article created time: ' + date);
             var _num = getHours(100, 0);
              superTest.put('/createArticle').send({ title: 'title' + _num, pub: 'thepub' + _num, pop : _num, tag: 'TAG', likes: _num, author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num, comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' , timeStamp: date }).expect(200).expect('Content-Type', /json/).end(function(err, res){
              if (err) throw err;
              if (num === (articleNumbers - 1)){done();}
              
              });

          }else{
            var _num = getHours(100, 0);
            superTest.put('/createArticle').send({ title: 'title' + _num, pub: 'thepub' + _num, pop : _num, tag: 'TAG', likes: _num, author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
            if (err) throw err;
            if (num === (articleNumbers - 1)){done();}
            
            });};

          }
          

         for (i = 0 ; i < articleNumbers; i++){
            createArticleFunc(i);
             
          }
     });

      it('confirm like has been updated', function(done){

              console.log('article url:  ' + articleUrl);


          var i=5;
          //var i=50;
          while(i--){

                //var date = new Date();
                var _ver;
              if (true){
               // var hours = getHours(0, -100);
                 // var date = timeController.getDateByHours(hours);

                _ver = timeController.getCurrentPublishingTimeForVersion(createDate)

              }else{
                _ver = timeController.getCurrentPublishingTimeForVersion()
              }
              

            console.log('VERSION confirm like has been updated: ' + _ver);

            superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){

             articleUrl = res.body.result.data.urls[0] ;

             //if(!articleUrl || err) throw new Error('article URL cant be emptied');
             console.log('res.body.result confirm like has been updated: ' + JSON.stringify(res.body.result));
                // should.exist(articleUrl);
                // expect(articleUrl.length).is.to.be.above(1);
                // should.not.exist(err);
                // expect(res.body.result.data.titles.length).is.to.be.equal(res.body.result.data.pubs.length);
                // expect(res.body.result.data.titles.length).is.to.be.equal(res.body.result.data.imgUrls.length);
                // expect(res.body.result.data.titles.length).is.to.be.equal(res.body.result.data.likes.length);
                // expect(res.body.result.data.titles.length).is.to.be.equal(res.body.result.data.pops.length);
                // expect(res.body.result.data.titles.length).is.to.be.equal(res.body.result.data.tags.length);
          //  
            });
          }

          done();
             // articleController.findByUrl(articleUrl, function(err, result){

      });


      it('confirm total number of articles matching the time range results from requests 0.0', function(done){

                //var hours = getHours(0, -100);

          var ver = timeController.getCurrentPublishingTimeForVersion(createDate)
          var dTime = ver * 60 *1000 * 30;
          var end  = new Date(dTime);
          var start = new Date();
          start.setTime(end.getTime() - 24 * 60 * 60 * 1000);

       superTest.put('/get').send({ ver: 1, start: start, end: end }).expect(200).end(function(err, res){
        // console.log('err ' + err);
        // console.log('RES body' + res.body);
        //   console.log('RES body.data' + res.body.result.data);
        //   console.log('RES res.body.result ' + res.body.result);

         // console.log('RES body JSON1: ' + JSON.stringify(res.body.result));
          console.log('res.body.result confirm like has been updated 0.0: ' + res.body.result.length);

         expect(res.body.result.data.titles.length).is.to.be.above(0);
         expect(res.body.result.data.pubs.length).is.to.be.above(0);
          expect(res.body.result.data.urls.length).is.to.be.above(0);
          done();

       });

   });


      it('confirm total number of articles matching the time range results from requests 0.1', function(done){

                //var hours = getHours(0, -100);

          var ver = timeController.getCurrentPublishingTimeForVersion(createDate)
          var dTime = ver * 60 *1000 * 30;
          var end  = new Date(dTime);
          var start = new Date();
          start.setTime(end.getTime() - 24 * 60 * 60 * 1000);

       superTest.put('/get').send({ ver: ver, start: null, end: null}).expect(200).end(function(err, res){
        // console.log('err ' + err);
        // console.log('RES body' + res.body);
        //   console.log('RES body.data' + res.body.result.data);
        //   console.log('RES res.body.result ' + res.body.result);

         // console.log('RES body JSON1: ' + JSON.stringify(res.body.result));
          console.log('res.body.result confirm like has been updated 0.1: ' + res.body.result.length);

         expect(res.body.result.data.titles.length).is.to.be.above(0);
         expect(res.body.result.data.pubs.length).is.to.be.above(0);
          expect(res.body.result.data.urls.length).is.to.be.above(0);
          done();

       });

   });

  it('confirm version', function(done){
     var ver = timeController.getCurrentPublishingTimeForVersion(createDate);
     expect(ver).to.be.equal(testVer);
     done();

  });

      it('confirm total number of articles matching the time range results from requests 1', function(done){

                //var hours = getHours(0, -100);
                  var start = timeController.getDateByHours(-100);
                  var end = timeController.getDateByHours(0);
                  var startVer = timeController.getCurrentPublishingTimeForVersion(start);
                  var endVer = timeController.getCurrentPublishingTimeForVersion(end);
                  console.log('startVer: ' + startVer + ' endVer: ' + endVer);
                  console.log('start: ' + start + ' endDate: ' + end);
             //     console.log('START ' + start);
           //       console.log('END ' + end);
                _ver = timeController.getCurrentPublishingTimeForVersion(start)



       superTest.put('/get').send({ ver: 1, start: start, end: end }).expect(200).end(function(err, res){
        // console.log('err ' + err);
        // console.log('RES body' + res.body);
        //   console.log('RES body.data' + res.body.result.data);
        //   console.log('RES res.body.result ' + res.body.result);

         // console.log('RES body JSON1: ' + JSON.stringify(res.body.result));
         expect(res.body.result.data.titles.length).is.to.be.above(articleNumbers - 10);
         expect(res.body.result.data.pubs.length).is.to.be.above(articleNumbers - 10);
          expect(res.body.result.data.urls.length).is.to.be.above(articleNumbers - 10);
          done();

       });

   });

      it('confirm total number of articles matching the time range results from requests 2', function(done){

                //var hours = getHours(0, -100);
                  var start = timeController.getDateByHours(-24);
                  var end = timeController.getDateByHours(0);
                  var startVer = timeController.getCurrentPublishingTimeForVersion(start);
                  var endVer = timeController.getCurrentPublishingTimeForVersion(end);
                  console.log('startVer2: ' + startVer + ' endVer: ' + endVer);
                  console.log('start2: ' + start + ' endDate: ' + end);
             //     console.log('START ' + start);
           //       console.log('END ' + end);
                _ver = timeController.getCurrentPublishingTimeForVersion(start)



       superTest.put('/get').send({ ver: 1, start: start, end: end }).expect(200).end(function(err, res){
        // console.log('err ' + err);
        // console.log('RES body' + res.body);
        //   console.log('RES body.data' + res.body.result.data);
        //   console.log('RES res.body.result ' + res.body.result);

          //console.log('RES body JSON1: ' + JSON.stringify(res.body.result));
          console.log('res.body.result.data.titles.length: ' + res.body.result.data.titles.length);
         expect(res.body.result.data.titles.length).is.to.be.above(0);
         expect(res.body.result.data.pubs.length).is.to.be.above(0);
          expect(res.body.result.data.urls.length).is.to.be.above(0);
          done();

       });

   });




      it('non existent date range backward', function(done){

                //var hours = getHours(0, -100);
                  var start = timeController.getDateByHours(-10000);
                  var end = timeController.getDateByHours(-1000);
             //     console.log('START ' + start);
           //       console.log('END ' + end);
                //_ver = timeController.getCurrentPublishingTimeForVersion(date)


       superTest.put('/get').send({ ver: 1, start: start, end: end }).expect(200).end(function(err, res){
        // console.log('err ' + err);
        // console.log('RES body' + res.body);
        //   console.log('RES body.data' + res.body.result.data);
        //   console.log('RES res.body.result ' + res.body.result);

         // console.log('RES body JSON1: ' + JSON.stringify(res.body.result));
         expect(res.body.result.data.titles.length).is.to.be.equal(0);

         //expect(res.body.result.data.titles.length).is.to.be.above(articleNumbers - 10);
         //expect(res.body.result.data.pubs.length).is.to.be.above(articleNumbers - 10);
          //expect(res.body.result.data.urls.length).is.to.be.above(articleNumbers - 10);
          done();

       });

   });

      it('non existent date range forward', function(done){

                //var hours = getHours(0, -100);
                  var start = timeController.getDateByHours(1);
                  var end = timeController.getDateByHours(1000);
             //     console.log('START ' + start);
           //       console.log('END ' + end);
                //_ver = timeController.getCurrentPublishingTimeForVersion(date)


       superTest.put('/get').send({ ver: 1, start: start, end: end }).expect(200).end(function(err, res){
        // console.log('err ' + err);
        // console.log('RES body' + res.body);
        //   console.log('RES body.data' + res.body.result.data);
        //   console.log('RES res.body.result ' + res.body.result);

         // console.log('RES body JSON1: ' + JSON.stringify(res.body.result));
         expect(res.body.result.data.titles.length).is.to.be.equal(0);

         //expect(res.body.result.data.titles.length).is.to.be.above(articleNumbers - 10);
         //expect(res.body.result.data.pubs.length).is.to.be.above(articleNumbers - 10);
          //expect(res.body.result.data.urls.length).is.to.be.above(articleNumbers - 10);
          done();

       });

   });


      it('non existent date backward', function(done){


               var date = timeController.getDateByHours(-1000);

                _ver = timeController.getCurrentPublishingTimeForVersion(date)


       superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){

         expect(res.body.result.data.titles.length).is.to.be.equal(0);
         
          done();

       });

   });

      it('non existent date forward', function(done){

               var date = timeController.getDateByHours(1000);

                _ver = timeController.getCurrentPublishingTimeForVersion(date)

       superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){
         expect(res.body.result.data.titles.length).is.to.be.equal(0);
         
          done();

       });

   });



    after( function(){

        articleController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove articles");
                  
                });

      });


    after( function(){

        publishingController.remove('ALL', function(err, succeed){

                  if (!succeed) throw new Error("Fail to remove publishing");
                });

      });







   });



    // describe("increaes like for Article 1 ---", function(){
    //   var articleNumbers = 5;
    //       //updateArticleLikeProcedure
    //   var articleUrl = null;
    //    var _isLike = Math.random() < 0.5 ? true : false;
    //     var article = null;

    //   before( function(done){
        
    //     var createArticleFunc = function(num){superTest.put('/createArticle').send({ title: 'title' + num, pub: 'thepub', pop : '4', tag: 'TAG', likes: '1', author: 'AUTHOR', url: 'URLURL' + num , imgUrl: 'IMAGEURL' + num , comment: 'COMMENT', adComment: 'AD COMMENT', adAuthor: 'adAuthor' }).expect(200).expect('Content-Type', /json/).end(function(err, res){
    //         if (err) throw err;
    //         if (num === (articleNumbers - 1)){done();}
            
    //     });};

    //      for (i = 0 ; i < articleNumbers; i++){
    //         createArticleFunc(i);
             
    //       }
    //  });

    //   before(function(done){
    //       var _ver = timeController.getCurrentPublishingTimeForVersion();
    //     superTest.put('/get').send({ ver: _ver }).expect(200).end(function(err, res){

    //          articleUrl = res.body.result.data.urls[0] ;

    //          if(!articleUrl || err) throw new Error('article URL cant be emptied');

    //         done();
          
    //      });
    //   });


    //   before(function(done){
         
        

    //          articleController.findByUrl(articleUrl, function(err, result){

    //            if(!articleUrl || err || !result) throw new Error('article URL cant be emptied with err ' + err);
    //             article = result;
    //             done();

    //          });     
    //    });


    //   before(function(done){
    //   ///var _ver = randomIntFromInterval(-1000000, 10000000);

    //   if(!articleUrl) throw new Error('article url cant be nil: ' + articleUrl);

    //     superTest.put('/updateArticleLikeProcedure').send({ url: articleUrl, isLike: _isLike }).expect(200).end(function(err, res){
    //       if(err){

    //         throw new Error(err);
    //       }else{

    //       done();  
    //       }
          
          
    //      });

    // });


      // it('confirm like has been updated', function(done){

      //         console.log('article url:  ' + articleUrl);
      //          done();

      //        articleController.findByUrl(articleUrl, function(err, result){

      //          if(!articleUrl || err || !result) throw new Error('article URL cant be emptied with err ' + err);
                
      //           if (_isLike){
      //             expect(result.likes).is.to.be.above(article.likes);
      //           }else{
      //             expect(result.likes).is.to.be.below(article.likes);
      //           }
                
               

      //       });
      // });


    //});

});

/////end describe and begin describe
