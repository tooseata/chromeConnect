jQuery.event.props.push("touches");
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
        console.log("connecting!!");
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
                doubleTap:function(event, target) {
                  socket.emit('zoomTapUndo', {"sessionHash": sessionHash});
                },
                longTap:function(event, target){
                  socket.emit('zoomTap', {"sessionHash": sessionHash});
                },
                fingers:$.fn.swipe.fingers.ALL,
                threshold: 20
              });
              
              document.body.addEventListener('touchmove', function(event) {
                  event.preventDefault();
                }, false);

              var startX;
              var startY;

              $("#controllerPad").on("touchstart", function(event){
                var targetEvent =  event.touches.item(0);
                startX = targetEvent.pageX;
                startY = targetEvent.pageY;
                event.preventDefault();
                return false;
              });

              $("#controllerPad").on("touchmove", function(event){
                // if (event.targetTouches.length == 1) {}
                  var targetEvent =  event.touches.item(0);
                  socket.emit('move', {"dx" : targetEvent.clientX - startX , "dy": targetEvent.clientY - startY, "sessionHash": sessionHash});
                  event.preventDefault();
                
              });
            }); // Touchable jQuery
            $(function() {
              $("#controllerPinch").swipe( {
                pinchStatus:function(event, phase, direction, distance , duration , fingerCount, pinchZoom) {
                  if (direction === "in"){
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
        console.log('DESKTOP');
      }; // is Desktop 