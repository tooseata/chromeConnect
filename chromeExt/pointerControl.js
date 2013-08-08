
// var tempX;
// var tempY;
// var currentX;
// var currentY;
// var windowWidth = document.body.scrollWidth;
// var windowHeight = document.body.scrollHeight;

// //Check whether browser supports locking or not
// var havePointerLock = 'webkitPointerLockElement' in document;
// //Get some random element in http://www.google.co.in/ page
// var element = document.getElementById("hplogo");
// //Bind an event Listener
// element.addEventListener("click", function () {
//     if (havePointerLock) {
//         // Ask the browser to lock the pointer
//         element.requestPointerLock = element.webkitRequestPointerLock;
//         element.requestPointerLock();
//         var pointer = document.getElementById("newPointer_chromeConnect");
//         if (pointer){
//             pointer.setAttributeNS(null,"visibility", "visible");
//         } else {
//             makePointer();
//         }
//         tempX = 0;
//         tempY = 0;
//         //Register lock change callback
//         document.addEventListener('webkitpointerlockchange', changeCallback, false);
//         //Register callback for all errors
//         document.addEventListener('webkitpointerlockerror', errorCallback, false);
//     } else {
//         alert("Your browser does not support Pointer Lock, Please Upgrade it");
//     }
// });


// // //create function, it expects 2 values.
// // function insertAfter(newElement,targetElement) {
// //     //target is what you want it to go after. Look for this elements parent.
// //     var parent = targetElement.parentNode;
    
// //     //if the parents lastchild is the targetElement...
// //     if(parent.lastchild == targetElement) {
// //         //add the newElement after the target element.
// //         parent.appendChild(newElement);
// //     } else {
// //         // else the target has siblings, insert the new element between the target and it's next sibling.
// //         parent.insertBefore(newElement, targetElement.nextSibling);
// //       }
// // }

// var makePointer = function() {
//     console.log('Creating Pointer');
//     var xmlns = "http://www.w3.org/2000/svg";
//     var pointer = document.createElementNS(xmlns, "circle");
//     var root = document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg") );
//     pointer.setAttributeNS(null, "id", "newPointer_chromeConnect");
//     pointer.setAttributeNS(null, "type", "image/svg+xml");
//     pointer.setAttributeNS(null, "data", "moving_circle.svg");
//     pointer.setAttributeNS(null, "cx", 50);
//     pointer.setAttributeNS(null, "cy", 50);
//     pointer.setAttributeNS(null, "r",  2);
//     pointer.setAttributeNS(null, "fill", "blue");
//     root.appendChild(pointer);
//     document.documentElement.appendChild(root);
// }

// var movePointerDirection = function(direction, distance){
//   switch(direction){
//     console.log(direction);
//     case "up":
//       // yPos is decreasing
//       break;

//     case "down":
//       //yPos is increasing 
//       break;

//     case "left":
//       //xPos is decreasing
//       break;

//     case "right":
//       //xPos is increasing 
//       break;

//     default:
//       return;
//   }

// };

// var movePointer = function(xPos, yPos, source) {

//   var pointerDirection = document.getElementById("newPointer_chromeConnect");
//     if (source === "nativeMouse"){
//       pointerDirection.setAttributeNS(null, "cx", xPos);
//       pointerDirection.setAttributeNS(null, "cy", yPos);
//     } else {
//         // if ()

//     }
    
// };


// function moveCallback(e) {

//     tempX += e.webkitMovementX;
//     tempY += e.webkitMovementY;
//     currentX = tempX + e.clientX;
//     currentY = tempY + e.clientY;

//     if(currentX < 0 || currentX > windowWidth || currentY< 0 || currentY > windowHeight){
//         document.webkitExitPointerLock();
//     } else{
//         movePointer(currentX,currentY,"nativeMouse");
//         //console.log('My Position is: ' + currentX + "," + currentY );
//     }
// }

// function logClick(e){
//     if (e._isSynthetic){
//       return;
//     }
//     //debugger;
//     var ee = document.createEvent("MouseEvents");
//     ee._isSynthetic = true;
//     x = currentX;
//     y = currentY;
//     ee.initMouseEvent("click", true, true, null, 1,x + e.screenX - e.clientX,y + e.screenY - e.clientY,x,y);
//     var target = document.elementFromPoint(x, y);
//     // TODO fix to find href 
//     if (target.tagName == 'A' || target.tagName.toLowerCase () !== "body" || target.tagName.toLowerCase () !== "html" || target.tagName.toLowerCase () !== "font"){
//       target.dispatchEvent(ee);
//     } else{
//         e.preventDefault();
//         e.stopPropagation();
//     }
// }

// function changeCallback() {
//     //Check for element whether locked is expected element or not
//     if (document.webkitPointerLockElement == element) {
//         // Pointer was just locked
//         // Enable the mousemove listener
//         document.addEventListener("mousemove", moveCallback, false);
//         document.addEventListener("click", logClick, false);
//     } else {
//         // Pointer was just unlocked
//         // Disable the mousemove listener
//         document.removeEventListener("mousemove", moveCallback, false);
//         var pointer = document.getElementById("newPointer_chromeConnect");
//         pointer.setAttributeNS(null,"visibility", "hidden");
//     }
// }

// function errorCallback(e) {
//     //Log Errors
//     console.log(e);
// }