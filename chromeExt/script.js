// Tab connection handeler 
var port = chrome.runtime.connect();
var tempX;
var tempY;
var tempClientX;
var tempClientY;
var currentX;
var currentY;
var windowWidth = document.body.scrollWidth;
var windowHeight = document.body.scrollHeight;
var element = document.body;
var lastPinchOutTotal = 0;
var lastPinchInTotal = 0;



chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "swipe" && request.fingerCount === 2) {
    pageScroll(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if(request.type === "swipe" && request.fingerCount === 3){
      pageToporBottom(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if (request.type === "navigation"){
      movePointer(request.xVal, request.yVal, "syntheticDirection");
  } else if (request.type === "fixedPointerOn"){
      fixedPointerOn();
  } else if (request.type === "pinchIn"){
      pinchPageIn(request.zoomScale);
  } else if (request.type === "pinchOut"){
      pinchPageOut(request.zoomScale);
  } else if (request.type === "pinchInTotal"){
      lastPinchInTotal = request.zoomScale;
  } else if (request.type === "pinchOutTotal"){
      lastPinchOutTotal = request.zoomScale;
  } else if (request.type === "zoomTapUndo"){
     console.log('zoomTapUndo');
     zoom.out();
  } else if (request.type === "zoomTap"){
     console.log('zoomTap');
     zoom.to({x: tempClientX,y: tempClientY,scale: 3});
  } else if (request.type === "click"){
     console.log('click');
  }
});

var pinchPageIn = function (zoomScale){
  console.log('Increasing Zoom');
  console.log('lastPinchInTotal', lastPinchInTotal);
  var pinchAmount = zoomScale * .2;
  var scaleIn = (pinchAmount + (lastPinchInTotal * .2)).toFixed(2);
  console.log('scaleIn', scaleIn);
  // var origScale = tempClientX + "px " + tempClientY+ "px";
  // document.body.style.setProperty("-webkit-transform-origin", origScale, null);
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
  var pinchAmount = zoomScale * .7 ;
  var scaleOut = (pinchAmount - (lastPinchOutTotal * .7)).toFixed(2);
  console.log('scaleOut', scaleOut);
  if(scaleOut <= 1.0){
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
    console.log('Creating Splah');
    var newDiv = document.createElement('image');
    newDiv.id = 'testSpash';
    document.body.appendChild(newDiv);
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
          if (pointer){
              pointer.style.visibility = 'visible';
          } else {
              makePointer();
          }
          tempX = 0;
          tempY = 0;
          //Register lock change callback
          document.addEventListener('webkitpointerlockchange', changeCallback, false);
          //Register callback for all errors
          document.addEventListener('webkitpointerlockerror', errorCallback, false);
      } else {
          alert("Your browser does not support Pointer Lock, Please Upgrade it");
      }
    }
});


element.addEventListener("mousemove", function(event){
  tempClientX = event.clientX;
  tempClientY = event.clientY;

});



var makePointer = function() {
    var chromeConnectPointer = chrome.extension.getURL('icons/arrow-cursor.png');
    var image = document.createElement('image');
    image.id = 'newPointer_chromeConnect';
    image.src = chromeConnectPointer;
    document.body.appendChild(image);
};


var movePointer = function(xPos, yPos, type) {
  console.log(type);
  var pointer = document.getElementById("newPointer_chromeConnect");
  if (type === "nativeDirection"){
    pointer.style.left = xPos+'px';
    pointer.style.top = yPos+'px';
  } else {
    tempX += xPos;
    tempY += yPos;
    currentX = tempX + tempClientX;
    currentY = tempY + tempClientY;
    pointer.style.left = (currentX/3) +'px';
    pointer.style.top = (currentY/3) +'px';
  }

};


var moveCallback = function (e) {
  console.log("e.webkitMovementX", e.webkitMovementX);
  console.log("e.webkitMovementY", e.webkitMovementY);
    tempX += e.webkitMovementX;
    tempY += e.webkitMovementY;
  console.log("tempX", tempX);
  console.log("tempY", tempY);
    // tempClientX = e.clientX;
    // tempClientY = e.clientY;
    currentX = tempX + tempClientX;
    currentY = tempY + tempClientY;

    if(currentX < 0 || currentX > windowWidth || currentY< 0 || currentY > windowHeight){
        //document.webkitExitPointerLock();
        console.log('Off screen');
        return;
    } else{
        movePointer(currentX,currentY,"nativeDirection");
    }
}


var logClick = function (e){
    console.log('Clicking');
    console.log(e._isSynthetic);
    if (e._isSynthetic){
      return;
    }
    var ee = document.createEvent("MouseEvents");
    ee._isSynthetic = true;
    x = currentX;
    y = currentY;
    ee.initMouseEvent("click", true, true, null, 1,
                      x + e.screenX - e.clientX,
                      y + e.screenY - e.clientY,
                      x,y,e.ctrlKey, e.altKey, 
                      e.shiftKey, e.metaKey, 0, null);
    var target = document.elementFromPoint(x, y);
    console.log("Target", target);
    if (target){
      target.dispatchEvent(ee);
    } else{
      e.preventDefault();
      e.stopPropagation();
    }
};

function changeCallback() {
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

function errorCallback(e) {
    //Log Errors
    console.log(e);
}