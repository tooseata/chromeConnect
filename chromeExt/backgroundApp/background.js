//PRODUCTION_
var socketserver = 'http://chromeconnect.jit.su:80';
var channelTabs = [];
var activeTab;
var storage = chrome.storage.local;
var socket;

storage.remove("socketState", function(confirm){
  console.log('Cleared Socket State');
});

storage.remove("currentToken", function(confirm){
  console.log('Cleared Current Token');
});

storage.remove("synthMouse", function(confirm){
  console.log('Cleared Current Token');
});


chrome.extension.onConnect.addListener(function(port) {
        var tabId = port.sender.tab.id;

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
  if(info){
    activeTab = info.tabId;
  }
});

var enableMouseNotification = {
  type: "list",
  title: "Enabling pointer control",
  message: "Press your ESC key to exit mouse control",
  iconUrl: "../icons/icon.png",
  items: [{ title: "Step 1", message: "Click anywhere in browser."},
          { title: "Step 2", message: "Click 'Allow' if prompted."},
          { title: "Step 3", message: "A red cursor will appear."}]
}

var gesterHelp = {
  type: "list",
  title: "Types of Gesters Supported",
  message: "Currently support the following: mouse control, swiping and zooming",
  iconUrl: "../icons/icon.png",
  items: [{ title: "Mouse Control", message: "One Finger drag"},
          { title: "Swiping", message: "Two Finger swipe up/down"},
          { title: "Zooming", message: "Pinch in/out on Pinch Tab"}]
}


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
        chrome.browserAction.setBadgeText({text: ""});
        storage.set({"socketState":0});
        socketConnection(request.type, request.tabID, request.windowID);
        break;

        case "enableMouseControl":
        storage.set({"synthMouse":1});
        chrome.notifications.create("enableMouse", enableMouseNotification, function (id){
          console.log("enableMouseControl notification sucess");
        })
        socketConnection(request.type, request.tabID, request.windowID);
        break;

        case "disableMouseControl":
        storage.set({"synthMouse":0});
        socketConnection(request.type, request.tabID, request.windowID);
        break;

        case "isMouseEnabled":
        // Check localstorage see user had enabled the Synth Pointer
        storage.get("synthMouse", function(data){
          if (data.synthMouse === 1){
            sendResponse({synthMouse: true});
          }
        });
        break;

        case "refreshConnection":
        socketConnection(request.type, request.tabID, request.windowID);
        break;

        case "showQR":
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          activeTab = tabs[0].id;
          chrome.tabs.sendMessage(activeTab, {"type": "refreshPage"});
        });
        break;

        case "gesterHelp":
        chrome.notifications.create("gesterHelp", gesterHelp, function (id){
          console.log("gesterHelp notification sucess");
        })
        break;

    }
    return true;
});

var socketConnection = function(type, tabID, windowID) {

  if(type === 'loadSocketConnection'){

    chrome.tabs.getCurrent(function(info) {
      if(info){
        activeTab = info.tabId;
      }
    });

    if (socket){
    } else {
      socket = io.connect(socketserver);
    };

    socket.on('connecting', function () {
    });

    socket.on('error', function () {
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
        chrome.tabs.query({active:true, currentWindow:true}, function(){
          chrome.extension.sendMessage({
            "type": "closeWindow"
          });
        });
    });

    socket.on('swipe', function(data){
      var notificationType = {"type": "swipe", "swipeDirection":data.direction, "fingerCount":data.fingerCount, "swipeDuration": data.duration, "swipDistance":data.distance};
      chrome.tabs.sendMessage(activeTab, notificationType);

    });

    socket.on('move', function(data){
      var notificationType = {"type": "navigation", "xVal" : data.dx, "yVal" : data.dy};
      chrome.tabs.sendMessage(activeTab, notificationType);

    });

    socket.on('pinchIn', function(data){
      var notificationType = {"type": "pinchIn", "zoomScale" : data.zoomScale};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('pinchOut', function(data){
      var notificationType = {"type": "pinchOut", "zoomScale" : data.zoomScale};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('zoomTapUndo', function(data){
      var notificationType = {"type": "zoomTapUndo"};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('zoomTap', function(data){
      var notificationType = {"type": "zoomTap"};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });

    socket.on('click', function(data){
      var notificationType = {"type": "click"};
      chrome.tabs.sendMessage(activeTab, notificationType);
    });
  }

  if(type === 'disconnectSocketConnection'){
      socket.disconnect();
  }

  if(type === 'refreshConnection'){
    chrome.tabs.getCurrent(function(info) {
      if(info){
        activeTab = info.tabId;
      }
    });
    socket.socket.reconnect();
  }

  if(type === 'enableMouseControl'){
      var notificationType = {"type": "fixedPointerOn"};
      chrome.tabs.sendMessage(activeTab, notificationType);
      chrome.tabs.query({active:true, currentWindow:true}, function(){
        chrome.extension.sendMessage({
          "type": "closeWindow"
        });
      });
  }

  if(type === 'disableMouseControl'){
      var notificationType = {"type": "fixedPointerOff"};
      chrome.tabs.sendMessage(activeTab, notificationType);
      chrome.tabs.query({active:true, currentWindow:true}, function(){
        chrome.extension.sendMessage({
          "type": "closeWindow"
        });
      });
  }

}; // End socketConnection
