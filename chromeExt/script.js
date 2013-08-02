// Custom Connection 
console.log('Hello, I was injected by Chrome Plugin');

// chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
//   switch(message.type) {
//     case "loadSocketIO":
//     console.log('Load a browser DOM related');
//     break;
//   }
// });

  // var port = chrome.runtime.connect({ name: "my-channel" });
  // port.postMessage({myProp: "value"});
  // port.onMessage.addListener(function(msg){
  //   if (msg.question == "Who's there?")
  //   port.postMessage({answer: "Madame"});
  //   console.log(msg);
  // });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });