// Tab connection handeler 
var port = chrome.runtime.connect();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "swipe" && request.fingerCount === 2) {
    pageScroll(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if(request.type === "swipe" && request.fingerCount === 3){
    pageToporBottom(request.swipeDirection, request.swipDistance, request.swipeDuration);
  }
});

var pageScroll = function(direction,distance,duration){
  if (direction === "up"){
    if(self.pageYOffset === 0){
      return;
    } else {
      self.scrollBy(0, -(distance) * 2);
    }
  } else if (direction === "down"){
      self.scrollBy(0, distance * 2);
  } else {
    // TODO
    // Check mouse pointer focus if side scrolling is accepted. 
  }
};

var pageToporBottom = function(direction, duration){
  if (direction === "up"){
    self.scrollTo(document.body.scrollHeight,0);
  } else if (direction === "down"){
    self.scrollTo(0,document.body.scrollHeight);
  }
};



