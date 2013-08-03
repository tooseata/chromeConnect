// Custom Connection 
console.log('Hello, I was injected by Chrome Plugin');

var testFunc = function(direction){
  console.log(direction);
}


// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
//   switch(message.type) {
//     case "loadSocketIO":
//     console.log('Load a browser DOM related');
//     break;
//   }
// });

// port.postMessage({myProp: "Current Tab Connected"});
// port.onMessage.addListener(function(msg){
//     testFunc(msg);
// });

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   });

var port = chrome.runtime.connect();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.swipeStatus) {
    testFunc(request.swipeStatus);
  }
});