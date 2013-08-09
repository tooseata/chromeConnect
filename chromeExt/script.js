// Tab connection handeler 
var port = chrome.runtime.connect();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "swipe" && request.fingerCount === 2) {
    pageScroll(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if(request.type === "swipe" && request.fingerCount === 3){
      pageToporBottom(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if (request.type === "navigation"){
      movePointer(request.xVal, request.yVal, "syntheticDirection");
  } else if (request.type === "fixedPointerOn"){
    console.log('Pointer Fixed Request');
    fixedPointerOn();
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


var fixedPointerOn = function(){
    console.log('Creating Splah');
    var newDiv = document.createElement('image');
    newDiv.id = 'testSpash';
    document.body.appendChild(newDiv);
}

// Pointer Control 


var tempX;
var tempY;
var tempClientX;
var tempClientY;
var currentX;
var currentY;
var windowWidth = document.body.scrollWidth;
var windowHeight = document.body.scrollHeight;



//Check whether browser supports locking or not

  var element = document.body;
  element.addEventListener("click", function (e) {
    if (e.target.id === "testSpash"){
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
    console.log("tempX" , tempX);
    tempY += yPos;
    console.log("tempY" , tempY);
    currentX = tempX + tempClientX;
    console.log("currentX" , currentX);
    currentY = tempY + tempClientY;
    console.log("currentY" , currentY);
    pointer.style.left = (currentX/3) +'px';
    pointer.style.top = (currentY/3) +'px';
  }

};


function moveCallback(e) {
    tempX += e.webkitMovementX;
    tempY += e.webkitMovementY;
    tempClientX = e.clientX;
    tempClientY = e.clientY;
    currentX = tempX + e.clientX;
    currentY = tempY + e.clientY;

    if(currentX < 0 || currentX > windowWidth || currentY< 0 || currentY > windowHeight){
        //document.webkitExitPointerLock();
        //console.log('Off screen');
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