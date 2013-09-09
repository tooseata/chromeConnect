var storage = chrome.storage.local;

window.onload = function() {

  storage.get("socketState", function(data){
    if (data.socketState === 0){
        $('#socket-connect-btn').toggleClass('off');
    } else if (data.socketState === 1){
        $('#socket-connect-btn').toggleClass('on');
        $('#qrcode_container').css("visibility", "visible");
    } else {
        $('#socket-connect-btn').toggleClass('off');
    }
  });

  storage.get("currentToken", function(data){
    if (data.currentToken !== undefined){
      makeCode(data.currentToken);
    }
  });

  storage.get("synthMouse", function(data){
    if (data.synthMouse === 0){
        $('#mouseControl').show();
        $('#mouseControlOff').hide();
    } else if (data.synthMouse === 1) {
        $('#mouseControl').hide();
        $('#mouseControlOff').show();
    } else {
        $('#mouseControl').show();
        $('#mouseControlOff').hide();
    }
  });

  document.getElementById("socket-connect-btn").onclick = function(e) {
    if($('#socket-connect-btn').hasClass('on')){
      _gaq.push(['_trackEvent', e.target.id, 'clicked']);
      $('#qrcode_container').css("visibility", "hidden");
      // Sends to background script
      chrome.extension.sendMessage({
        type: "disconnectSocketConnection"
      });
      window.close();
    } else {
      $('#qrcode_container').css("visibility", "visible");
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

  document.getElementById("mouseControlOff").onclick = function() {
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
      var current = tabs[0];
      var tabID = current.id;
      var windowID = current.windowId;

      // Sends to background script
      chrome.extension.sendMessage({
            "type": "disableMouseControl",
            "windowID": windowID,
            "tabID": tabID
      });
    });
  };

  document.getElementById("refreshConnection").onclick = function() {
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
      var current = tabs[0];
      var tabID = current.id;
      var windowID = current.windowId;

      // Sends to background script
      chrome.extension.sendMessage({
            "type": "refreshConnection",
            "windowID": windowID,
            "tabID": tabID
      });
    });
  };

  document.getElementById("gesterHelp").onclick = function() {
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
      var current = tabs[0];
      var tabID = current.id;
      var windowID = current.windowId;

      // Sends to background script
      chrome.extension.sendMessage({
            "type": "gesterHelp",
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
  //PRODUCTION_
  var url = "http://chromeconnect.jit.su/";
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

$('#qrcode').hover(function() {
        $(this).find('#refreshConnection').show();
    },
    function () {
        $(this).find('#refreshConnection').hide();
    }
);


// Popup Message Pipline from background script
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  // Close Pop after the pairing connection has been made
  if (request.type === "closeWindow"){
      window.close();
  }
});

// Google Analytics Tracker
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43870655-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();







