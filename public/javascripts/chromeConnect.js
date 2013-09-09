jQuery.event.props.push("touches");
//PRODUCTION_
var socketUrl = 'http://' + location.hostname + ':80';
      var isMobileDevice = Modernizr.touch;
      var socket = io.connect(socketUrl);

      socket.on('connecting', function () {
        console.log('Setting Up connection');
      });

      socket.on('error', function () {
        console.log('error');
      });
    
      // Check Device Type
      socket.on('checkDevice', function () {
        // Using modernizr feature detection for mobile touch events
        if(isMobileDevice){
          isTouchable();
        } else{
          isNotTouchable();
        }
      }); // main check

      var isTouchable = function(){
        var urlPath = document.location.pathname;
        var sessionHash = urlPath.substring(1,urlPath.lenght);
        socket.emit('initiateController', {sessionHash: sessionHash});
        socket.on('controllerAuthorization', function (data) {
          if(data){
            var sessionHash = data;
            //Touchable jQuery 
            $(function() {
              $("#controllerPad").swipe( {
                swipe:function(event, direction, distance, duration, fingerCount) {
                  if(fingerCount > 1){
                    socket.emit('swipe', {"direction" : direction, "fingerCount":fingerCount, "distance":distance, "duration":duration, "sessionHash": sessionHash});
                  }
                },
                tap:function(event, target) {
                  socket.emit('click', {"sessionHash": sessionHash});
                },
                fingers:$.fn.swipe.fingers.ALL,
                threshold: 20
              });

              document.body.addEventListener('touchmove', function(event) {
                  event.preventDefault();
                }, false);

              var startX;
              var startY;
              var lastXVal = 0;
              var lastYVal = 0;

              $("#controllerPad").on("touchstart", function(event){
                var targetEvent =  event.touches.item(0);
                startX = targetEvent.pageX;
                startY = targetEvent.pageY;
                event.preventDefault();
                return false;
              });

              $("#controllerPad").on("touchmove", function(event){
                  var targetEvent =  event.touches.item(0);
                  lastXVal = lastXVal - (startX - targetEvent.clientX);
                  lastYVal = lastYVal - (startY - targetEvent.clientY);
                  if (Math.abs(lastXVal) < 30 && Math.abs(lastYVal) < 30){
                    socket.emit('move', {"dx" : lastXVal , "dy": lastYVal, "sessionHash": sessionHash});
                  }
                  event.preventDefault();
                  lastXVal = startX - targetEvent.clientX;
                  lastYVal = startY - targetEvent.clientY;
              });
            }); // Touchable jQuery
            $(function() {
              $("#controllerPinch").swipe( {
                pinchStatus:function(event, phase, direction, distance , duration , fingerCount, pinchZoom) {
                  if (direction === "in" && distance < 380){
                    socket.emit('pinchIn', {"direction" : direction, "distance": distance, "zoomScale": pinchZoom, "sessionHash": sessionHash});
                  } else if (direction === "out"){
                    socket.emit('pinchOut', {"direction" : direction, "distance": distance, "zoomScale": pinchZoom, "sessionHash": sessionHash});
                  } else {
                    return;
                  }
                },
                pinchIn: function(event, direction, distance, duration, fingerCount, pinchZoom) {
                  socket.emit('pinchInTotal', {"zoomScale": pinchZoom, "sessionHash": sessionHash});
                },
                pinchOut: function(event, direction, distance, duration, fingerCount, pinchZoom) {
                  socket.emit('pinchOutTotal', {"zoomScale": pinchZoom, "sessionHash": sessionHash});
                },
                tap:function(event, target) {
                  socket.emit('zoomTap', {"sessionHash": sessionHash});
                },
                doubleTap:function(event, target){
                  socket.emit('zoomTapUndo', {"sessionHash": sessionHash});
                },
                fingers: 2,
                allowPageScroll:"none",
                pinchThreshold:5
              });
            }); // Touchable jQuery
          } else{
            socket.disconnect();
            alert('You have been disconnected. Wrong Key');
          }
        });

      }; // is Mobile 

      var isNotTouchable = function() {
        alert("Use a device with a touchable interface")
      }; // is Desktop 