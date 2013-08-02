var socketserver = 'http://127.0.0.1:9999';

// while (typeof window.io !== 'undefined') {
//     debugger;
//     var socket = io.connect(socketserver);
//     socket.on('connect', function () {
//        // When we receive our game code, show the user
//       socket.on("desktopAccessToken", function(gameCode){
//         console.log("Game Code ________: " + gameCode);
//          // $("#gameConnect").show();
//          // $("#gameCode").html(gameCode);
//       });
//     });
// }
// listening for an event / one-time requests

// coming from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {

        case "loadSocketConnection":
        socketConnection(request.type, request.tabID, request.windowID);
        chrome.browserAction.setBadgeBackgroundColor({color: "#0000FF"});
        chrome.browserAction.setBadgeText({text: "Wait"});
        break;

        case "disconnectSocketConnection":
        break;

    }
    return true;
});

// // listening for an event / long-lived connections
// // coming from devtools
// chrome.extension.onConnect.addListener(function (port) {
//     port.onMessage.addListener(function (message) {
//         switch(port.name) {
//       case "color-divs-port":
//         colorDivs();
//       break;
//     }
//     });
// });

var socketConnection = function(type, tabID, windowID) {

  if(type === 'loadSocketConnection'){
    var socket = io.connect(socketserver);
    socket.on('connecting', function () {
        console.log('Setting Up connection');
    });
    socket.on('error', function () {
        console.log('error');
    });
    socket.on('connect', function(){
      console.log('Socket Connected', socket);
      socket.emit('initiateDesktop', {"sessionTab": tabID, "sessionWindow": windowID});
    });

    socket.on('desktopAccessToken', function(data){
      //chrome.browserAction.setPopup({popup: "browseraction/confirm.html"});
      alert("Go to www.foo.com and enter your code to connect: " + data);
    });

    socket.on('linkMobileDevice', function(data){
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data, function(response){
          console.log(response.farewell);
        });
      });

      // chrome.extension.onMessage.addListener(function(port){
      //     if(port.name == 'my-channel'){
      //         port.onMessage.addListener(function(msg){
      //             port.postMessage({question: "Who's there?"});
      //             console.log(msg);
      //         });
      //     }
      // });
      chrome.browserAction.setBadgeText({text: "Live"});
      console.log("Passthough: ", data);
    });

    socket.on('swipeDirective', function(data){
      console.log(data.direction);
    });
} // End socketConnection

// send a message to the content script
var loadSocketsLibary = function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "loadSocketIO"});
    chrome.browserAction.setBadgeText({text: "connected!"});
  });
};
};