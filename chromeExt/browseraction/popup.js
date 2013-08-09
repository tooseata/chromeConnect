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

// Local storage functionality not working correctly 

  // document.getElementById("mouseControl").onclick = function() {
  //   chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
  //         debugger;
  //     var current = tabs[0];
  //     var tabID = current.id;

  //       if(document.getElementById('mouseControl').checked){
  //         storage.set({tabID:"true"});
  //       } else{
  //         storage.set({tabID:"false"});
  //       }
  //       storage.get(tabID + '', function(inStorage){
  //             debugger;
  //         if(inStorage){
  //            document.getElementById('mouseControl').checked = true;
  //            chrome.extension.sendMessage({
  //              type: "enableMouseControl"
  //            });
  //         } else{
  //             document.getElementById('mouseControl').checked = false;
  //         }
  //       });
  //   });
  // };


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

// // Accepting Access token then displaying to user. 
// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
//   debugger;
//   if(message.accessToken) {
//     var tokenView = document.getElementById("myHeader");
//     tokenView.innerHTML = request.accessToken;
//   }
//   return true;
// });