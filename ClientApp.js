var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
//var pg = require('pg');
var qs = require('querystring');
var Server = require('./ClientServer');
var conString = "postgres://user:password@host:port/database";

var port = process.env.PORT || 5001;
var dir = process.cwd();
var connectionsArray = [];

//db.connect();
app.listen(port);

function handler(req, res) {

	if ('/' == req.url) { //if home, req url =127.0.0.1:8080/
			Server.LoginForm(res, fs);
			console.log("new user");//	
	}
}
console.log(port);

// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {

  console.log('Number of connections:' + connectionsArray.length);
  // starting the loop only if at least there is one user connected
  if (!connectionsArray.length) {
	data = new Date;
    //updateSockets(data); 
	}

  socket.on('disconnect', function() {
    var socketIndex = connectionsArray.indexOf(socket);
    console.log('socket = ' + socketIndex + ' disconnected');
    if (socketIndex >= 0) {
      connectionsArray.splice(socketIndex, 1);
    }
  });

  console.log('A new socket is connected!');
  connectionsArray.push(socket);
  
    socket.on('client_data', function(data){
		process.stdout.write(data.letter);
		updateSockets(data.letter, socket);
	});

});

var updateSockets = function(data, socket) {
  
  connectionsArray.forEach(function(tmpSocket) {
	if(tmpSocket != connectionsArray.indexOf(socket)){
		tmpSocket.emit('notification', data);
		console.log(data);
	}
  });
};