var mongoose = require('mongoose');
var config = require('../config');

if(config.dbExternal){

console.log('connecting external db ' + config.dbPathExternal);
mongoose.connect(config.dbPathExternal);

}else{

console.log('connecting local db' + config.dbPathLocal);
mongoose.connect(config.dbPathLocal);

}

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function dbOpen() {
	console.log('successfully opened the db');
});

exports.mongoose = mongoose;
