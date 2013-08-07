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

  distance = (distance * 4);

  if (direction === "up"){
    if(self.pageYOffset === 0){
      return;
    } else {
      smoothScroll(-Math.abs(distance));
    }
  } else if (direction === "down"){
      smoothScroll(distance);
  } else {
    // TODO
    // Check mouse pointer focus if side scrolling is accepted. 
  }
};

function smoothScroll(distance) {
  var startY   = self.pageYOffset;
  distance = distance + startY;
  var stopY    = distance;
  if (distance < 25) {
    scrollTo(0, stopY); return;
  }
  var speed = Math.round(distance / 100);
  if (speed >= 20) speed = 20;
  var step  = Math.round(distance / 25);
  var leapY = stopY > startY ? startY + step : startY - step;
  var timer = 0;
  if (stopY > startY) {
    for (var i=startY; i<stopY; i+=step ) {
      setTimeout("self.scrollTo(0, "+leapY+")", timer * speed);
      leapY += step; if (leapY > stopY) leapY = stopY; timer++;
    } return;
  }
  for (var i=startY; i>stopY; i-=step ) {
    setTimeout("self.scrollTo(0, "+leapY+")", timer * speed);
    leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
  }
}

var pageToporBottom = function(direction, duration){
  var scrollSpeed = duration < 200 ? -600 : -400;
  var timeOut;
  if (direction === "up"){
    scrollToTop();
    function scrollToTop(){
     if (document.body.scrollTop!==0 || document.documentElement.scrollTop!==0){
       self.scrollBy(0,scrollSpeed);
       timeOut=setTimeout(scrollToTop,10);
     } else {
       clearTimeout(timeOut);
     }
    }
  } else if (direction === "down"){
      scrollSpeed = Math.abs(scrollSpeed);
      scrollToBottom();
      function scrollToBottom(){
        var pageHeightDiff = Math.max(document.documentElement.scrollTop,document.body.scrollTop);
        if ((pageHeightDiff+document.documentElement.clientHeight)!== document.documentElement.scrollHeight){
          self.scrollBy(0,scrollSpeed);
          timeOut=setTimeout(scrollToBottom,10);
        } else {
         clearTimeout(timeOut);
          }
      }
    }
};
