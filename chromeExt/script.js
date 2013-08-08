// Tab connection handeler 
var port = chrome.runtime.connect();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "swipe" && request.fingerCount === 2) {
    pageScroll(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if(request.type === "swipe" && request.fingerCount === 3){
      pageToporBottom(request.swipeDirection, request.swipDistance, request.swipeDuration);
  } else if (request.type === "navigation"){
      movePointer(request.xVal, request.yVal, "syntheticDirection");
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



// Pointer Control 


var tempX;
var tempY;
var currentX;
var currentY;
var windowWidth = document.body.scrollWidth;
var windowHeight = document.body.scrollHeight;

//Check whether browser supports locking or not
var havePointerLock = 'webkitPointerLockElement' in document;
//Get some random element in http://www.google.co.in/ page
var element = document.getElementById("hplogo");
//Bind an event Listener
element.addEventListener("click", function () {
    if (havePointerLock) {
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.webkitRequestPointerLock;
        element.requestPointerLock();
        var pointer = document.getElementById("newPointer_chromeConnect");
        if (pointer){
            pointer.setAttributeNS(null,"visibility", "visible");
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
});


// //create function, it expects 2 values.
// function insertAfter(newElement,targetElement) {
//     //target is what you want it to go after. Look for this elements parent.
//     var parent = targetElement.parentNode;
    
//     //if the parents lastchild is the targetElement...
//     if(parent.lastchild == targetElement) {
//         //add the newElement after the target element.
//         parent.appendChild(newElement);
//     } else {
//         // else the target has siblings, insert the new element between the target and it's next sibling.
//         parent.insertBefore(newElement, targetElement.nextSibling);
//       }
// }

var makePointer = function() {
    console.log('Creating Pointer');
    /*
    var xmlns = "http://www.w3.org/2000/svg";
    var pointer = document.createElementNS(xmlns, "circle");
    var root = document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg") );
    pointer.setAttributeNS(null, "id", "newPointer_chromeConnect");
    pointer.setAttributeNS(null, "type", "image/svg+xml");
    pointer.setAttributeNS(null, "data", "moving_circle.svg");
    pointer.setAttributeNS(null, "cx", 50);
    pointer.setAttributeNS(null, "cy", 50);
    pointer.setAttributeNS(null, "r",  10);
    pointer.setAttributeNS(null, "fill", "blue");
    root.appendChild(pointer);
    */
    var image = document.createElement('image');
    image.id = 'newPointer_chromeConnect';
    image.src = "http://png-2.findicons.com/files/icons/2232/wireframe_mono/48/cursor_arrow.png";
    document.body.appendChild(image);
};

var movePointerDirection = function(direction, distance){
  var xVal, yVal;
  console.log('xVal ' + xVal);
  console.log('yVal ' + yVal);
  console.log('currentX ' + currentX);
  console.log('currentY ' + currentY);
  console.log('Distance ' + distance);

  switch(direction){
    case null:
    break;

    case "up":
      // yPos is decreasing
      yVal += (currentY - distance);
      movePointer(currentX,yVal);
      break;

    case "down":
      //yPos is increasing 
      yVal += (currentY + distance);
      movePointer(currentX,yVal);
      break;

    case "left":
      //xPos is decreasing
      xVal += (currentX - distance);
      movePointer(xVal,currentY);
      break;

    case "right":
      //xPos is increasing 
      xVal += (currentX + distance);
      movePointer(xVal,currentY);
      break;
  }

};

var movePointer = function(xPos, yPos, type) {
  debugger;
  if (type === "nativeDirection"){
    var pointer = document.getElementById("newPointer_chromeConnect");
    pointer.style.left = xPos+'px';
    pointer.style.top = yPos+'px';
  }

};


function moveCallback(e) {
    debugger;
    tempX += e.webkitMovementX;
    tempY += e.webkitMovementY;
    // tempClientX = e.clientX;
    // tempClientY = e.clientY;
    currentX = tempX + e.clientX;
    currentY = tempY + e.clientY;

    if(currentX < 0 || currentX > windowWidth || currentY< 0 || currentY > windowHeight){
        document.webkitExitPointerLock();
    } else{
        movePointer(currentX,currentY,"nativeDirection");
        //console.log('My Position is: ' + currentX + "," + currentY );
    }
}

function logClick(e){
    if (e._isSynthetic){
      return;
    }
    var ee = document.createEvent("MouseEvents");
    ee._isSynthetic = true;
    x = currentX;
    y = currentY;
    ee.initMouseEvent("click", true, true, null, 1,x + e.screenX - e.clientX,y + e.screenY - e.clientY,x,y);
    var target = document.elementFromPoint(x, y);
    // TODO fix to find href 
    if (target.tagName == 'A' || target.tagName.toLowerCase () !== "body" || target.tagName.toLowerCase () !== "html" || target.tagName.toLowerCase () !== "font"){
      target.dispatchEvent(ee);
    } else{
        e.preventDefault();
        e.stopPropagation();
    }
}

function changeCallback() {
    //Check for element whether locked is expected element or not
    if (document.webkitPointerLockElement == element) {
        // Pointer was just locked
        // Enable the mousemove listener
        document.addEventListener("mousemove", moveCallback, false);
        document.addEventListener("click", logClick, false);
    } else {
        // Pointer was just unlocked
        // Disable the mousemove listener
        document.removeEventListener("mousemove", moveCallback, false);
        var pointer = document.getElementById("newPointer_chromeConnect");
        pointer.setAttributeNS(null,"visibility", "hidden");
    }
}

function errorCallback(e) {
    //Log Errors
    console.log(e);
}