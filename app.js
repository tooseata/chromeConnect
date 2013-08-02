var express = require('express')
  , http = require('http')
  , url = require('url')
  , _ = require('underscore')
  , path = require('path')
  , io = require('socket.io')
  , crypto = require('crypto');

var app = express();
var prompt = require('prompt');
var server = http.createServer(app);
var root = __dirname;
var io = require('socket.io').listen(server);
var socketCodes = {};

app.configure(function(){
  app.use(express.static(path.join(root, 'public')));
});

app.get('/', function(req, res){
  res.send(root, + 'index.html');
});

io.sockets.on('connection', function(socket){

  socket.emit('checkDevice',{});
  socket.on('initiateDesktop', function(data){
    var sessionTab = data.sessionTab;
    var sessionWindow = data.sessionWindow;
    var gameCode = crypto.randomBytes(3).toString('hex');

    // Make sure the Token within the hash is unique  
    while(gameCode in socketCodes){
      gameCode = crypto.randomBytes(3).toString('hex');
    }

    // Assign a key to the socket object and assign the value to the gameCode
    socket.browserToken = gameCode;
    socketCodes[socket.browserToken] = socket;
    // Emit Gamecode to client to display to user
    socket.emit("desktopAccessToken", gameCode);

    console.log(gameCode);
    console.log("Session Tab: " + sessionTab + " || Session Window: " + sessionWindow);
  }); // initiateDesktop connection 


  socket.on('initiateController', function(data){
    var isValidSession = data.sessionHash;
    //console.log("isValidSession ___________ ", isValidSession);
    // Cycle through all the desktop clients and find the browser with the same token as the mobile device 
    if (isValidSession in socketCodes){
       // emit to Desktop Pair
       socketCodes[isValidSession].emit("linkMobileDevice", {test:"We Are Connected to Phone"});
       socket.emit("controllerAuthorization", isValidSession);
       socket.on('swipeDirection', function(data){
         var token = data.sessionHash;
         console.log('Swipe Direction Token ______' + token);
         if(token in socketCodes){
          socketCodes[token].emit("swipeDirective", {"direction": data.direction});
          console.log(data.direction);
         }
       });

    } else {
       socket.emit("controllerAuthorization", false);
      }
  }); // initiateController connection 




}); // Main Connect



io.sockets.on('disconnect', function(data){

}); // Main Disconnect 



// function tick () {
//   var now = new Date().toUTCString();
//   // a message is emitted when a message sent with socket.send is received
//   io.sockets.send(now);
// }
// setInterval(tick, 1000);

server.listen(9999);





