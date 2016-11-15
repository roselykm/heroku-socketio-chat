var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//the port is what heroku assign to us
app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');

  	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});

  	socket.on('message', function(msg){
    	console.log('Message Received: ', msg);
    	socket.broadcast.emit('message', msg);
  	});
});

http.listen(app.get('port'), function() {
  console.log('Socket.io chat is running on port', app.get('port'));
});
