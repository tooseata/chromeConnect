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

app.get('/', function(req, res){
  res.status(200);
  res.sendfile(root + '/public/splash.html');
});

app.configure(function(){
  app.use(express.static(path.join(root, 'public')));
});

app.get('/:connectid', function(req, res){
  res.status(200);
  res.sendfile(root + '/public/index.html');
});

io.set('transports', ['websocket']);

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

  }); // initiateDesktop connection 

  socket.on('initiateController', function(data){
    var isValidSession = data.sessionHash;
    // Cycle through all the desktop clients and find the browser with the same token as the mobile device 
    if (isValidSession in socketCodes){
       // emit to Desktop Pair
       socketCodes[isValidSession].emit("linkMobileDevice", {test:"We Are Connected to Phone"});
       socket.emit("controllerAuthorization", isValidSession);
    } else {
       socket.emit("controllerAuthorization", false);
      }
  }); // initiateController connection 

  socket.on('swipe', function(data){
    socketCodes[data.sessionHash].emit("swipe", {"direction": data.direction, "fingerCount" : data.fingerCount, "distance":data.distance, "duration":data.duration});
  });

  socket.on('move', function(data){
    socketCodes[data.sessionHash].emit("move", {"dx": data.dx, "dy" : data.dy});
  });

  socket.on('pinchIn', function(data){
    socketCodes[data.sessionHash].emit("pinchIn", {"direction": data.direction, "distance" : data.distance, "zoomScale" : data.zoomScale });
  });


  socket.on('pinchOut', function(data){
    socketCodes[data.sessionHash].emit("pinchOut", {"direction": data.direction, "distance" : data.distance, "zoomScale" : data.zoomScale });
  });

  socket.on('pinchInTotal', function(data){
    socketCodes[data.sessionHash].emit("pinchInTotal", {"zoomScale": data.zoomScale});
  });

  socket.on('pinchOutTotal', function(data){
    socketCodes[data.sessionHash].emit("pinchOutTotal", {"zoomScale": data.zoomScale});
  });

  socket.on('zoomTapUndo', function(data){
    var token = data.sessionHash;
    if(token in socketCodes){
      socketCodes[token].emit("zoomTapUndo", {});
    }
  });

  socket.on('zoomTap', function(data){
    socketCodes[data.sessionHash].emit("zoomTap", {});
  });

  socket.on('click', function(data){
    socketCodes[data.sessionHash].emit("click", {});
  });
}); // Main Connect

io.sockets.on('disconnect', function(socket){
  if(socket.browserToken in socketCodes){
     delete socketCodes[socket.browserToken];
   }
});

//PRODUCTION_
server.listen(80);