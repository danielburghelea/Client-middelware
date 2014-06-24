var express			= require('express');
var morgan         	= require('morgan');
var bodyParser     	= require('body-parser');
var methodOverride 	= require('method-override');
var cookieParser 	= require('cookie-parser');
var session      	= require('express-session')
var app            	= express();

var port = process.env.PORT || 8001;


app.use(cookieParser());
app.use(session({ secret: 'keyboard cat'}));
app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 					// log every request to the console
app.use(bodyParser()); 						// pull information from html in POST
app.use(methodOverride()); 	


// routes ======================================================================
require('./routes')(app); // load our routes and pass in our app

// launch ======================================================================
var server = app.listen(port);
var io = require('socket.io').listen(server);

console.log('The magic happens on port ' + port);
