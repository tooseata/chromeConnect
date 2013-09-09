// Tab connection handeler 
var port = chrome.runtime.connect();
var tempX;
var tempY;
var tempClientX = window.outerWidth / 2;
var tempClientY = window.outerHeight / 2;
var currentX = 10;
var currentY = 10;
var windowWidth = document.body.scrollWidth;
var windowHeight = document.body.scrollHeight;
var element = document.body;
var lastPinchOutTotal = 0;
var lastPinchInTotal = 0;


//Check Local storage is Synt mouse pointer is enabled
chrome.runtime.sendMessage({type: "isMouseEnabled"}, function(response) {
  if (response.synthMouse){
    fixedPointerOn();
  }
});

// Listener for calculating Mouse X and Y position. 
element.addEventListener("mousemove", function(e){
  tempClientX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
  tempClientY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "swipe" && request.fingerCount === 2) {
    pageScroll(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if(request.type === "swipe" && request.fingerCount === 3){
      pageToporBottom(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if (request.type === "navigation"){
      movePointer(request.xVal * 1.7, request.yVal * 1.7, "syntheticDirection");
  } else if (request.type === "fixedPointerOn"){
      fixedPointerOn();
  } else if (request.type === "fixedPointerOff"){
      fixedPointerOff();
  } else if (request.type === "pinchIn"){
      pinchPageIn(request.zoomScale);
  } else if (request.type === "pinchOut"){
      pinchPageOut(request.zoomScale);
  } else if (request.type === "pinchInTotal"){
      lastPinchInTotal = request.zoomScale;
  } else if (request.type === "pinchOutTotal"){
      lastPinchOutTotal = request.zoomScale;
  } else if (request.type === "zoomTapUndo"){
     zoom.out();
  } else if (request.type === "zoomTap"){
     zoom.to({x: tempClientX,y: tempClientY,scale: 3});
  } else if (request.type === "click"){
     createClick();
  } else if (request.type === "refreshPage"){
     location.reload();
  } 
});

var pinchPageIn = function (zoomScale){
  var pinchAmount = zoomScale * .5;
  var scaleIn = (pinchAmount + (lastPinchInTotal * .5)).toFixed(2);
  if (scaleIn >= 1.0 && scaleIn <= 3.0) {
    setOrigin(tempClientX,tempClientY);
    document.body.style.setProperty("-webkit-transform", "scale(" + scaleIn + "," + scaleIn + ")", null);
  } else {
    return false;
  }
};

var setOrigin = function(x, y){
  var origin = x +'px '+ y +'px';
  var transform = 'translate('+ x +'px,'+ y +'px)';
  document.body.style.WebkitTransformOrigin = origin;
  document.body.style.WebkitTransform = transform;
  document.body.style.WebkitTransition = '-webkit-transform 0.8s ease';
};


var pinchPageOut = function (zoomScale){
  var pinchAmount = zoomScale;
  var scaleOut = (pinchAmount - (lastPinchOutTotal)).toFixed(2);
  if(scaleOut <= 1.0){
    zoom.out();
    return false;
  } else {
    document.body.style.setProperty("-webkit-transform", "scale(" + scaleOut + "," + scaleOut + ")", null);
  }
};

var pageScroll = function(direction,distance,duration){
  distance = (distance * 4);
  if (direction === "up"){
    if(self.pageYOffset === 0){
      return;
    } else {
      smoothScroll(-Math.abs(distance),"vertical");
    }
  } else if (direction === "down"){
      smoothScroll(distance, "vertical");
  } else if (direction === "right"){
      smoothScroll(distance, "horizontal");
  } else if (direction === "left"){
      smoothScroll(-Math.abs(distance), "horizontal");
  }
};

var smoothScroll = function (distance, direction) {
  var startPosition;
  if(direction === "vertical"){
    startPosition = self.pageYOffset;
    distance = distance + startPosition;
    var stopPosition = distance;
    if (distance < 25) {
      scrollTo(0, stopPosition); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step  = Math.round(distance / 25);
    var leapY = stopPosition > startPosition ? startPosition + step : startPosition - step;
    var timer = 0;
    if (stopPosition > startPosition) {
      for (var i=startPosition; i<stopPosition; i+=step ) {
        setTimeout("self.scrollTo(0, "+leapY+")", timer * speed);
        leapY += step; if (leapY > stopPosition) leapY = stopPosition; timer++;
      } return;
    }
      for (var i = startPosition; i>stopPosition; i-=step ) {
        setTimeout("self.scrollTo(0, "+leapY+")", timer * speed);
        leapY -= step; if (leapY < stopPosition) leapY = stopPosition; timer++;
      }
  } else if (direction === "horizontal"){
    startPosition = self.pageXOffset;
    distance = distance + startPosition;
    var stopPosition = distance;
    if (distance < 25) {
      scrollTo(stopPosition, 0); return;
    }
    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step  = Math.round(distance / 25);
    var leapX = stopPosition > startPosition ? startPosition + step : startPosition - step;
    var timer = 0;
    if (stopPosition > startPosition) {
      for (var i=startPosition; i<stopPosition; i+=step ) {
        setTimeout("self.scrollTo("+leapX+", 0)", timer * speed);
        leapX += step; if (leapX > stopPosition) leapX = stopPosition; timer++;
      } return;
    }
      for (var i = startPosition; i>stopPosition; i-=step ) {
        setTimeout("self.scrollTo("+leapX+", 0)", timer * speed);
        leapX -= step; if (leapX < stopPosition) leapX = stopPosition; timer++;
      }
  }
};

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


var fixedPointerOn = function(){
  var newDiv = document.createElement('image');
  newDiv.id = 'testSpash';
  document.body.appendChild(newDiv);
}

var fixedPointerOff = function(){
  document.getElementById("newPointer_chromeConnect").remove();
}

// Pointer Control 
element.addEventListener("click", function (e) {
  if (e.target.id === "testSpash"){
    //Check whether browser supports locking or not
    var havePointerLock = 'webkitPointerLockElement' in document;
      if (havePointerLock) {
          // Ask the browser to lock the pointer
          element.requestPointerLock = element.webkitRequestPointerLock;
          element.requestPointerLock();
          var pointer = document.getElementById("newPointer_chromeConnect");
          makePointer();
          tempX = 5;
          tempY = 5;
          //Register lock change callback
          var removeSplash = document.getElementById("testSpash");
          removeSplash.parentNode.removeChild(removeSplash);
          document.addEventListener('webkitpointerlockchange', changeCallback, false);
          //Register callback for all errors
          document.addEventListener('webkitpointerlockerror', errorCallback, false);
      }
  }
});

var makePointer = function() {
    var chromeConnectPointer = chrome.extension.getURL('icons/arrow-cursor.png');
    var image = document.createElement('image');
    image.id = 'newPointer_chromeConnect';
    image.src = chromeConnectPointer;
    image.style.left = currentX +'px';
    image.style.top = currentY +'px';
    document.body.appendChild(image);
};


var movePointer = function(xPos, yPos, type) {
  var pointer = document.getElementById("newPointer_chromeConnect");
  if (type === "nativeDirection"){
    pointer.style.left = xPos+'px';
    pointer.style.top = yPos+'px';
  } else {
      tempX += xPos;
      tempY += yPos;
      currentX = tempX + tempClientX;
      currentY = tempY + tempClientY;
      if(currentX <= 0 || currentX >= windowWidth || currentY <= 0 || currentY >= windowHeight){
        document.webkitExitPointerLock();
      } else {
        pointer.style.left = currentX +'px';
        pointer.style.top = currentY +'px';
      }
  }

};


var moveCallback = function (e) {
  tempX += e.webkitMovementX;
  tempY += e.webkitMovementY;
  currentX = tempX + tempClientX;
  currentY = tempY + tempClientY;


    if(currentX <= 0 || currentX >= windowWidth || currentY <= 0 || currentY >= windowHeight){
      document.webkitExitPointerLock(); 
      return;
    } else{
        movePointer(currentX,currentY,"nativeDirection");
    }
}


var logClick = function (e){

    if (e._isSynthetic){
      return;
    }
    var ee = document.createEvent("MouseEvents");
    ee._isSynthetic = true;
    x = currentX ;
    y = currentY;
    ee.initMouseEvent("click", true, true, null, 1,
                      x + e.screenX - e.clientX,
                      y + e.screenY - e.clientY,
                      x,y,e.ctrlKey, e.altKey, 
                      e.shiftKey, e.metaKey, 0, null);
    var target = document.elementFromPoint(x, y);
    if (target){
      target.dispatchEvent(ee);
    } else{
      e.preventDefault();
      e.stopPropagation();
    }
};

var createClick = function(){
  var ee = document.createEvent("MouseEvents");
    x = currentX;
    y = currentY;
    ee.initMouseEvent("click", true, true, null, 1,
                      x,y,x,y,false, false, 
                      false, false, 0, null);
    var target = document.elementFromPoint(x, y);
    if (target){
      target.dispatchEvent(ee);
    } else{
      e.preventDefault();
      e.stopPropagation();
    }
};

var changeCallback = function() {
    //Check for element whether locked is expected element or not
    if (document.webkitPointerLockElement == element) {
        // Pointer was just locked
        document.addEventListener("mousemove", moveCallback, false);
        document.addEventListener("click", logClick, false);
    } else {
        // Pointer was just unlocked
        document.removeEventListener("mousemove", moveCallback, false);
        document.removeEventListener("click", logClick, false);
        var pointer = document.getElementById("newPointer_chromeConnect");
        // pointer.style.visibility = 'hidden';
    }
}

var errorCallback = function (e) {
    //Log Errors
    console.log(e);
}