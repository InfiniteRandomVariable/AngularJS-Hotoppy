


var Promise = require("bluebird");
var Publishing = require('../models/publishingSchema');
var timeController = require('../controllers/timeController');
var assert = require('assert');


function publishingController(){

"use strict";
  var self = {};





 var findAll =  function(fn) {
       
        Publishing.find({}, function(err, result) {
         
          fn(err, result);
        });

    };

  var remove = function(criteria, fn){
    if (criteria === null || typeof criteria === 'undefined'){

      fn(null, false);

    }else if (criteria === 'ALL'){
//.exec();

      Publishing.remove({}, function(err){

        if(err) fn(err, false);
        fn(null, true);

          });

    }else{

      Publishing.findOneAndRemove(criteria, function(err){
        if(err) fn(err, false);
        fn(null, true);

        });
    }


  };

  self.remove = remove;

  self.findAll = findAll;


  self.parseArticles = function(articles, fn){
    //  console.log('parseArticles 0.0');
   if( Object.prototype.toString.call( articles ) === '[object Array]' ) {
  //  console.log('parseArticles 0.1');
               var titles = [] ,
                pubs = [] ,
                pops =  [] ,
                tags = [] ,
                likes = [] ,
                urls =  [] ,
                imgUrls = [] ,
                nComs = [] ,
                tComs = [] ,
                articleDates = [] ,
                comments =  [] ,
                authors = [],
                adComments = [],
                adAuthors =  [];

                  var arrayLength = articles.length;
                  for (var i = 0; i < arrayLength; i++) {
                          
                      var article = articles[i];
                       // console.log('Number of article ' + i.toString());

                        for (var key in article){
                          var keyStr = key.toString();
                          var value = article[keyStr];
                          switch (keyStr)
                            {
                               case 'title':
                                    titles.push(value); 
                                    break;
                               case 'pub':
                                   pubs.push(value);
                                    break;                                    
                               case '_id':
                                    articleDates.push(value.getTimestamp());
                                    break;
                               case 'pop':
                                    pops.push(value);
                                    break;
                               case 'tag':
                                    tags.push(value);
                                    break;
                               case 'likes':
                                    likes.push(value);
                                    break;                                                
                               case 'url':
                                    urls.push(value);
                                    break;
                               case 'imgUrl':
                                    imgUrls.push(value);
                                    break;
                               case 'comment':
                                    comments.push(value);
                                    break;
                               case 'author':
                                    authors.push(value);
                                    break;
                               case 'tCom':
                                    tComs.push(value);
                                    break;
                               case 'nCom':
                                    nComs.push(value);
                                    break;                                                                  
                               case 'adComment':
                                    adComments.push(value);
                                    break;
                               case 'adAuthor':
                                    adAuthors.push(value);
                                    break;
                               default:
                                   //console.log('Unmatch condition for key: ' + keyStr); 
                                    break;
                            }
                         }

                 }
                 //assert(titles.length === pubs.length === articleDates.length === pops.length === tags.length === likes.length === urls.length === imgUrls.length === comments.length === authors.length ===  adComments.length === adAuthors.length, 'ERROR: not equal array size for variables');

                
              //var totalLength = (titles.length + pubs.length + articleDates.length + pops.length + tags.length + likes.length + urls.length + imgUrls.length + comments.length + authors.length +  adComments.length + adAuthors.length);
            
               //assert((( totalLength % titles.length) === 0  &&  totalLength / titles.length === 12 ), 'ERROR: not equal array size for variables');


                 // console.log('Title Length ' + titles.length);
                 // console.log(pubs.length);
                 // console.log(articleDates.length);
                 // console.log(pops.length);
                 // console.log(tags.length);
                 // console.log(likes.length);
                 // console.log(urls.length);
                 // console.log(imgUrls.length);
                 // console.log(comments.length);
                 // console.log(authors.length);
                 // console.log(adComments.length);
                 // console.log(adAuthors.length);
            //     console.log('parseArticles 0.2');

                var firstTimeStamp;
                var aURL;
                var art;
                if(arrayLength > 1){
                   art = articles[1];
                  firstTimeStamp = art.timeStamp; 
                  aURL = art.url; //for testing only

                }
                
                 var version = timeController.getCurrentPublishingTimeForVersion(firstTimeStamp);
                 console.log('creating publishing version:' + version + ' firstTimeStamp ' + firstTimeStamp + ' URL ' + aURL + ' article ' + articles.length + ' lenght ' + arrayLength);
                 fn({'titles': titles, 'pubs' : pubs, 'articleDates': articleDates, 'pops': pops, 'tags': tags, 'likes' : likes, 'urls' : urls , 'imgUrls' : imgUrls , 'comments' : comments, 'authors' : authors , 'adComments': adComments, 'adAuthors': adAuthors, 'status': 'NO_STATUS', 'ver': Number(version) });

           }else{

          //  console.log('parseArticles 0.5');
              console.log('ERROR: expecting an array! publishingController.js');
               fn(null);
            }
  };
  self.clean = function(pubObj){
    if (!pubObj) return null;

    var pb = {};
    for (var prop in pubObj){

      if (prop === 'titles' || prop === 'pubs' || prop === 'articleDates'|| prop === 'pops'|| prop === 'tags'|| prop === 'likes'|| prop === 'urls' || prop === 'imgUrls'|| prop === 'comments' || prop === 'authors' || prop === 'adComments'|| prop === 'adAuthors'|| prop === 'status'|| prop === 'ver'){
        pb[prop] = pubObj[prop];
      }
    }
    return pb;
  };

  self.createPublishing = function (pubObj, fn){
            
            Publishing.create(pubObj, function(err, result, changes) {

                        if (err) {
                            console.log(err);
                            fn(err, false);
                          }
                          else {


                            fn(null, true, result);
                          }
                  });
  };



  self.createPublishingProcedure = function(articles, callBack){
    //  console.log('createPublishingProcedure 0.0');

    var promise = new Promise(function(resolve, reject) {
      //    resolve(articles);      

              self.parseArticles(articles,function(articleObject){
            if (articleObject){
                resolve(articleObject);
            }else{
              reject('fail to parseArticles');
            }

      });
    });

    return promise.then(function(articleObject){
     // console.log('createPublishingProcedure 2 ' + articleObject);
      articleObject.status = "OK";
      return articleObject;
    }).then(function(articleObject){

      //console.log('createPublishingProcedure 3');

      return new Promise(function(resolve, reject) {
        self.createPublishing(articleObject, function(err, succeed, pub){
            if(err) reject(err);
            if(succeed === false) reject('PUBLISHING: fail to create publishing');
        //    console.log('createPublishingProcedure 4 succeed: ' + succeed + ' pub ' + pub);
            resolve(pub);
        });
      });

    }).then(function(pub){
      //console.log('createPublishingProcedure 5 succeed:  ' + pub);

      callBack(pub);
    });
  };





  self.findOneByVersion = function ( _ver, fn){
    if(_ver < 2){
      fn(null, null);
      return 
    }
        Publishing.findOne({ver: Number(_ver)}, function(err,obj) { 
           fn(err, obj);
        });

    };

  return self;

}

//This class shouldn't be exposed to public and is for private use only.
module.exports = new publishingController();


