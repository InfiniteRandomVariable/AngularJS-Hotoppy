
var Article = require('../models/articleSchema');

function articleController () {


"use strict";

   // var PublishingController = require('./publishingController');

    var self = {};


  var remove = function(criteria, fn){
    if (criteria === null || criteria === undefined){

      fn(null, false);

    }else if (criteria === 'ALL'){
//.exec();

      Article.remove({}, function(err){

        if(err) {return fn(err, false); }
        fn(null, true);

          });

    }else{

      Article.findOneAndRemove(criteria, function(err){
        if(err) {return fn(err, false);}
        fn(null, true);

        });
    }


  };




    var findAll =  function(fn) {

        Article.find({}, function(err, result) {
          fn(err, result);
        });

    };

    var find =  function(criteria, fn) {

        Article.find(criteria, function(err, result) {
          fn(err, result);
        });

    };

  self.findArticlesByDateRange = function(start, end, callBack){
      var isDate = (Object.prototype.toString.call(start) !== '[object Date]') ? false || (Object.prototype.toString.call(end) !== '[object Date]')|| false : true;

      if (isDate === false){
        return callBack('require date object', null);
      }


      if (start.getTime() > end.getTime()){

          var e = new Error('start time cant bigger the end time')

        return callBack(e, null);
      }
      
      //{$lt: start, $gt: end}
      //{$lt: start, $gt: end}
      find({ timeStamp: {$lt: end, $gt: start} }, function(err, result){
        callBack(err, result);
      });

    };


  var findOne =  function(criteria, fn) {

        Article.findOne(criteria, function(err, result) {
         // console.log('Article find one');
          fn(err, result);
        });

    };

    self.findOne = findOne;

    var testOne =  function(criteria, fn) {
        fn('h', null);
     };

    var findById = function(artId, fn){

      Article.findById(artId, function(err, obj){

        if(err) throw new Error('Error finding Article by id ' + err);
        fn(err, obj);

      });
    };

  var update = function(artId, obj, fn){

    Article.update({ _id: artId}, obj, {upsert: false}, function(err, doc){

        if (err) throw new Error('Error reseting user.dailyLimit: ' + err);
        fn(err, doc);
    });
  };

  var findByUrl = function(artUrl, callBack){

    findOne({url: artUrl}, function(err, obj){

      callBack(err, obj);

    });

  };

  self.findByUrl = findByUrl;

  self.update = update;

  var updateArticleLikeProcedure = function(artUrl, isLike, callBack){
    
    if (!artUrl || typeof(isLike) !== "boolean" ) throw new Error('check url parameters ' + artUrl + ' isLike: ' + isLike);
    
    findByUrl( artUrl, function(err, obj){
    
      if(err || !obj || isNaN(parseInt(obj.likes))){

        throw new Error('something wrong: ' + err + ' object: ' + obj + ' obj.likes: ' + isNaN(parseInt(obj.likes)));
       //return callBack(err, null);
      }
      else if (isLike)obj.likes++;
      else obj.likes--;

      update(obj._id, {likes: obj.likes}, function(err, doc){
    
        callBack(err, doc);
      });

    });
  };

    self.updateArticleLikeProcedure = updateArticleLikeProcedure;
    self.remove = remove;
    self.findById = findById;
    self.find = find;
    self.findAll = findAll;
  

    var create = function(obj, callBack){
        if(!obj)throw new Error('article object cant be nil');
        Article.create(obj, function(err, result, changes){
          callBack(err, result, changes);
        });

    };

    self.create = create;



    return self;
  }

module.exports = new articleController();

