var express = require('express');

var restify = require('restify');
var config = require('./config');

var logger = require('morgan');
var isTesting = true;
var basePath = './secure/';
var certPath = basePath + 'server.crt';
var keyPath = basePath + 'key.pem';
var bodyParser = require('body-parser');
var path = require('path');

//callback = (typeof callback === 'function') ? callback : function() {};

//var model = require('./models/model-' + config.dataBackend)(config);

//var model = 'model';

var app = express();

if (isTesting){
	app.use(logger('dev'));
}


//app.use(logger('dev'));
app.use(bodyParser.json());

//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.disable('etag');

// app.use(restify.bodyParser({
// 	maxBodySize: 10 * 1024
// }));

//app.use(restify.queryParser());
//app.use(cookieParser());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.all('/*', function(req, res, next) {
	// CORS headers
	res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	// Set custom headers for CORS
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	if (req.method == 'OPTIONS') {
	res.status(200).end();
	} else {
	next();
	}
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// restify.CORS.ALLOW_HEADERS.push('Accept-Encoding');
// restify.CORS.ALLOW_HEADERS.push('Accept-Language');
// restify.CORS.ALLOW_HEADERS.push('accept');
// restify.CORS.ALLOW_HEADERS.push('sid');
// restify.CORS.ALLOW_HEADERS.push('lang');
// restify.CORS.ALLOW_HEADERS.push('origin');
// restify.CORS.ALLOW_HEADERS.push('withcredentials');
// restify.CORS.ALLOW_HEADERS.push('x-requested-with');


// app.get('/test', function (req,res,next) {
// 	res.writeHead(200, {
//     "Content-Type": "text/plain",
//     "Access-Control-Allow-Origin":"*"
// });
//     res.send({
//         status: "ok"
//     });
//     return next();
// });

// app.use(restify.CORS());
// app.opts(/.*/, function (req,res,next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
//     res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
//     res.send(200);
//     return next();
// });

// app.use(
//   function crossOrigin(req,res,next){
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     return next();
//   }
// );


// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you
// are sure that authentication is not needed
//app.all('/api/v1/*', [require('./middlewares/validateRequest')]);



// var port = process.env.PORT || (process.argv[2] || config.port || 3000);
// port = (typeof port === "number") ? port : 3000;

// app.listen(port, function() {
// 	console.log('server listening on port number', port);
	
// });

var router = express.Router();

var routes = require('./routes/routes')(router);
//var routes = require('./routes/routes')(app, model);

module.exports = app;