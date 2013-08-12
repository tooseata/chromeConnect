var storage = chrome.storage.local;

window.onload = function() {

  storage.get("socketState", function(data){
    if (data.socketState === 0){
        $('#socket-connect-btn').toggleClass('off');
    } else if (data.socketState === 1){
        $('#socket-connect-btn').toggleClass('on');
    } else {
        $('#socket-connect-btn').toggleClass('off');
    }
  });

  storage.get("currentToken", function(data){
    if (data.currentToken !== undefined){
      makeCode(data.currentToken);
    }
  });

  document.getElementById("socket-connect-btn").onclick = function() {
    if($('#socket-connect-btn').hasClass('on')){
      // Sends to background script
      chrome.extension.sendMessage({
        type: "disconnectSocketConnection"
      });
    } else {
      chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
        var current = tabs[0];
        var tabID = current.id;
        var windowID = current.windowId;
        // Sends to background script
        chrome.extension.sendMessage({
              "type": "loadSocketConnection",
              "windowID": windowID,
              "tabID": tabID
        });
      });
    }
  };

  document.getElementById("mouseControl").onclick = function() {
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
      var current = tabs[0];
      var tabID = current.id;
      var windowID = current.windowId;

      // Sends to background script
      chrome.extension.sendMessage({
            "type": "enableMouseControl",
            "windowID": windowID,
            "tabID": tabID
      });
    });
  };
};

var qrcode = new QRCode("qrcode", {
  width: 100,
  height: 100
});

// jQuery 
var makeCode = function (token) {
  var url = "http://chromeconnect.nodejitsu.com/";
  var newUrl = url + token;
  qrcode.makeCode(newUrl);
  $('#connectID').text(newUrl);
};

// Accepting Access token then displaying to user. 
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === "showQR") {
    storage.set({"currentToken":request.token});
    makeCode(request.token);
  }
  return true;
});




// if (request.type === "reloadCurrentQR"){
//     storage.get("currentToken", function(data){
//       makeCode(data.currentToken);
//     });
//   }

// chrome.browserAction.onClicked.addListener(function(info){
//     if(info){
//       console.log('Fired');
//       chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
//         chrome.extension.sendMessage({
//           "type": "reloadCurrentQR"
//         });
//       });
//     }
// });










