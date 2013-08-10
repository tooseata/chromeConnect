var storage = chrome.storage.local;

window.onload = function() {

  document.getElementById("socketConnection").onclick = function() {
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


  document.getElementById("socketDisconnection").onclick = function() {
    // Sends to background script
    chrome.extension.sendMessage({
          type: "disconnectSocketConnection"
      });
  };

};

var qrcode = new QRCode("qrcode", {
  width: 100,
  height: 100,
});

function makeCode (token) {
  var url = "http://chromeconnect.nodejitsu.com/";
  var newUrl = url + token;
  qrcode.makeCode(newUrl);
}

// Accepting Access token then displaying to user. 
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.type === "showQR") {
    console.log(request.token);
    makeCode(request.token);
  }
  return true;
});














