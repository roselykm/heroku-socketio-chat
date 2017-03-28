var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res){
   res.sendfile('index.html');
});

var users = [];

io.on('connection', function(socket){
   var sessionid = socket.id;
   var name = socket.handshake.query['name'];

   var user = new Object();
   user.socketid = sessionid;
   user.name =name;
   users.push(user);

   //send info on current users online to using the sessionid
   var socketmsg = JSON.stringify({
      type: "onlineusers",
      users: users
   }); 

   //console.log(socketmsg);
   //io.sockets.connected[sessionid].send(socketmsg);
   users.forEach( function (user)
   {
      var socketid = user.socketid;
      io.sockets.connected[socketid].send(socketmsg);
   });  
 
      console.log('a user connected - username: ' + name);

      socket.on('disconnect', function(){
      //get the socketid;
      var sessionid = socket.id;

      //get the object in the array
      var index = -1;
      var disconnectedusername = "";
      users.forEach( function (user, i)
      {
        var socketid = user.socketid;
        disconnectedusername = user.name;
        if (socketid == sessionid) 
          index = i;
      });

      if (index > -1) {
        users.splice(index, 1);
      }

      if (users.length > 0) {        
        var socketmsg = JSON.stringify({
          type: "onlineusers",
          //message: onlineusers
          users: users
        }); 

        //console.log(socketmsg);

        users.forEach( function (user)
        {
          var socketid = user.socketid;
          io.sockets.connected[socketid].send(socketmsg);
        });        
      }

    	console.log('user disconnected - ' + disconnectedusername);
  	});

  	socket.on('message', function(msg){
      var sessionid = socket.id;
      var msgobject = JSON.parse(msg);

      users.forEach( function (user)
      {
        var socketid = user.socketid;
        if (sessionid == socketid)
          name = user.name;
      });

      console.log('Message Received From: ', name);
      console.log('Message : ', msg);

      if (msgobject.type == "private messaging") {
         var msgfrom = msgobject.from;

         var msgto = msgobject.to;
         var tosocketid = "";

         var themessage = msgobject.message;

         users.forEach( function (user)
         {
            var socketid = user.socketid;
            var name = user.name;

            if (name == msgto)
               tosocketid = user.socketid;   
         });        

         //get the socketid
         var socketmsg = JSON.stringify({
            type: "private messaging",
            from: msgfrom,
            message: themessage
         }); 

         //send only to the intended recipient
         console.log("sending private message - FROM:" + msgfrom + " - TO:" + msgto + " - MSG:" + themessage + " - SOCKETID:" + tosocketid);
         io.sockets.connected[tosocketid].send(socketmsg);
      }
  	});
});

http.listen(app.get('port'), function() {
  console.log('Socket.io chat is running on port', app.get('port'));
});
