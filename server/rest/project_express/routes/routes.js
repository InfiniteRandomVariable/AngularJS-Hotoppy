
var article = require('../controllers/articleController');
var restController = require('../controllers/restController');
//var validating = require('../middleware/validating');

module.exports = function(app, model) {

	
	app.get('/', function(req, res, next) {
		return res.send("WELCOME TO REST API");
	});

  

	 //Client-to-NODE
	 app.get('/getArticles',  function(req, res, next) { 

     return restController.getArticles(req, res, next, model)
  }); 




	 //todo create an middleware
	 //https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

	//REQUIRE VALIDATION
	 //like, comment

	 //keep this method private
	 app.put('/createArticle', function(req, res, next) { 

      return restController.createArticle(req, res, next, model)
    }); //PYTHON-to-Node

	 //app.put('/createArticle', restController.moreArticles);
	 app.put('/createLike', function(req, res, next) { 
      return restController.createLike(req, res, next, model)
    }
); //Client-to-NODE

	 app.put('/createUser',function(req, res, next) { 

      return restController.createUser(req, res, next, model)
    }); //Client-to-NODE
	 app.put('/loginUser', function(req, res, next) { 

      return restController.loginUser(req, res, next, model)
    }); //Client-to-NODE
   app.put('/get', function(req, res, next) { 

      return restController.findPublisherProcedure(req, res, next, model)
  });  //Client-to-NODE






   app.put('/updateArticleLikeProcedure', function(req, res, next) { 

      return restController.updateArticleLikeProcedure(req, res, next, model)
    }); //Client-to-NODE

	 // app.post('/createLike', article.createArticle);
	 // app.post('/createLike', article.createArticle);


};


function series(callbacks, last) {
  var results = [];
  function next() {
    var callback = callbacks.shift();
    if(callback) {
      callback(function() {
        results.push(Array.prototype.slice.call(arguments));
        next();
      });
    } else {
      last(results);
    }
  }
  next();
}
// Example task
function async(arg, callback) {
  var delay = Math.floor(Math.random() * 5 + 1) * 100; // random ms
  console.log('async with \''+arg+'\', return in '+delay+' ms');
  setTimeout(function() { callback(arg * 2); }, delay);
}
function final(results) { console.log('Done', results); }

series([
  function(next) { async(1, next); },
  function(next) { async(2, next); },
  function(next) { async(3, next); },
  function(next) { async(4, next); },
  function(next) { async(5, next); },
  function(next) { async(6, next); }
], final);


function hello(next) { async(1, next);}



