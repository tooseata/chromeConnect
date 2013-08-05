var socketserver = 'http://chromeconnect.nodejitsu.com:80';
//var socketserver = 'http://127.0.0.1:8080';
var channelTabs = [];
var activeTab;

chrome.extension.onConnect.addListener(function(port) {
        var tabId = port.sender.tab.id;
        console.log('Received request from content script', port);

        // add tab when opened
        if (channelTabs.indexOf(tabId) == -1) {
          channelTabs.push(tabId);
        }

        // remove when closed/directed to another url
        port.onDisconnect.addListener(function() {
          channelTabs.splice(channelTabs.indexOf(tabId), 1);
        });
});

chrome.tabs.onActivated.addListener(function(info) {
  console.log('My Tab Changed');
  if(info){
    activeTab = info.tabId;
  }
});

// coming from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {

        case "loadSocketConnection":
        socketConnection(request.type, request.tabID, request.windowID);
        chrome.browserAction.setBadgeBackgroundColor({color: "#0000FF"});
        chrome.browserAction.setBadgeText({text: "Wait"});
        break;

        case "disconnectSocketConnection":
        socketConnection(request.type, request.tabID, request.windowID);
        chrome.browserAction.setBadgeText({text: ""});
        break;

    }
    return true;
});


var socketConnection = function(type, tabID, windowID) {
  var socket = io.connect(socketserver);
  if(type === 'loadSocketConnection'){
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

      for(var i = 0, len = channelTabs.length; i < len; i++) {
        chrome.tabs.get(channelTabs[i], function(tab) {
          if(tab.active === true){
            activeTab = tab.id;
          }
        });
      }
      chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
      chrome.browserAction.setBadgeText({text: "Live"});
      console.log("Verify: ", data);
    });

    socket.on('swipe', function(data){
      var notificationType = {"type": "swipe", "swipeDirection":data.direction, "fingerCount":data.fingerCount, "swipeDuration": data.duration, "swipDistance":data.distance};
      console.log("Swipe direction is " + data.direction + " using " + data.fingerCount + " fingers" + " the distance is " + data.distance + " the duration is " + data.duration);
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('swipeStatus', function(data){
      console.log("Swiped " + data.distance + ' px');
      //var notificationType = {"type": "swipe"};
      //chrome.tabs.sendMessage(activeTab, notificationType);

    });

    socket.on('pinchStatus', function(data){
      console.log("Pinched " + data.distance + ' px');
    });

    socket.on('pinchIn', function(data){
      console.log("You pinched " + data.direction + " by " + data.distance + "px, zoom scale is "+ data.pinchZoom);
    });

    socket.on('pinchOut', function(data){
      console.log("You pinched " + data.direction + " by " + data.distance + "px, zoom scale is "+ data.pinchZoom);
    });
  } else if(type === 'disconnectSocketConnection'){
      socket.disconnect();
      console.log('You Have Been Disconnected');
  } 

};// End socketConnection


// // send a message to the content script
// var loadSocketsLibary = function() {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {type: "loadSocketIO"});
//     chrome.browserAction.setBadgeText({text: "connected!"});
//   });
// };