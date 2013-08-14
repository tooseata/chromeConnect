var socketserver = 'http://chromeconnect.nodejitsu.com:80';
//var socketserver = 'http://127.0.0.1:9999';
var channelTabs = [];
var activeTab;
var storage = chrome.storage.local;

storage.remove("socketState", function(confirm){
  console.log('Cleared Socket State');
});

storage.remove("currentToken", function(confirm){
  console.log('Cleared Current Token');
});

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
        storage.set({"socketState":1});
        break;

        case "disconnectSocketConnection":
        socketConnection(request.type, request.tabID, request.windowID);
        chrome.browserAction.setBadgeText({text: ""});
        storage.set({"socketState":0});
        break;

        case "enableMouseControl":
        console.log('Click ON');
        socketConnection(request.type, request.tabID, request.windowID);
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
      socket.emit('initiateDesktop', {"sessionTab": tabID, "sessionWindow": windowID});
    });

    socket.on('desktopAccessToken', function(data){
      chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        var current = tabs[0];

        chrome.extension.sendMessage({
              "type": "showQR",
              "token": data
        });
      });
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
      // console.log("Verify: ", data);
    });

    socket.on('swipe', function(data){
      var notificationType = {"type": "swipe", "swipeDirection":data.direction, "fingerCount":data.fingerCount, "swipeDuration": data.duration, "swipDistance":data.distance};
      // console.log("Swipe direction is " + data.direction + " using " + data.fingerCount + " fingers" + " the distance is " + data.distance + " the duration is " + data.duration);
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('move', function(data){
      // console.log("Move Data", data);
      var notificationType = {"type": "navigation", "xVal" : data.dx, "yVal" : data.dy};
      chrome.tabs.sendMessage(activeTab, notificationType);

    });

    socket.on('pinchIn', function(data){
      var notificationType = {"type": "pinchIn", "zoomScale" : data.zoomScale};
      chrome.tabs.sendMessage(activeTab, notificationType);
      // console.log("You pinched " + data.direction + " by " + data.distance + "px, zoom scale is "+ data.zoomScale);
    });

    socket.on('pinchOut', function(data){
      var notificationType = {"type": "pinchOut", "zoomScale" : data.zoomScale};
      chrome.tabs.sendMessage(activeTab, notificationType);
      // console.log("You pinched " + data.direction + " by " + data.distance + "px, zoom scale is "+ data.zoomScale);
    });

    socket.on('zoomTapUndo', function(data){
      // console.log('zoomTapUndo');
      var notificationType = {"type": "zoomTapUndo"};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('zoomTap', function(data){
      // console.log('zoomTap');
      var notificationType = {"type": "zoomTap"};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('click', function(data){
       // console.log('click');
      var notificationType = {"type": "click"};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

  }

  if(type === 'disconnectSocketConnection'){
      socket.disconnect();
      // console.log('You Have Been Disconnected');
  }

  if(type === 'enableMouseControl'){
      var notificationType = {"type": "fixedPointerOn"};
      chrome.tabs.sendMessage(activeTab, notificationType);
  }
}; // End socketConnection
