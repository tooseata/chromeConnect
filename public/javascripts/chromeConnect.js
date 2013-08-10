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
                  socket.emit('swipe', {"direction" : direction, "fingerCount":fingerCount, "distance":distance, "duration":duration, "sessionHash": sessionHash});
                },
                // swipeStatus:function(event, phase, direction, distance , duration , fingerCount) {
                //    socket.emit('swipe', {"direction" : direction, "fingerCount":fingerCount, "distance":distance, "duration":duration, "sessionHash": sessionHash});
                //      if(phase === $.fn.swipe.phases.PHASE_END || phase === $.fn.swipe.phases.PHASE_CANCEL) {
                //         // no swipe
                //       } 
                // },
                fingers:$.fn.swipe.fingers.ALL,
                threshold: 0
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

            //Touchable Scroll 
            $(function() {
              $("#controller").swipe( {
                tap:function(event, target) {
                  socket.emit('zoomTapUndo', {"sessionHash": sessionHash});
                },
                doubleTap:function(event, target) {
                  socket.emit('zoomTap', {"sessionHash": sessionHash});
                },
                longTap:function(event, target){
                  socket.emit('changeTab', {"sessionHash": sessionHash});
                }
              });// swipe

              document.body.addEventListener('touchmove', function(event) {
                  event.preventDefault();
                }, false);

              var startX;
              var startY;

              $("#controller").on("touchstart", function(event){
                var targetEvent =  event.touches.item(0);
                startX = targetEvent.pageX;
                startY = targetEvent.pageY;
                event.preventDefault();
                return false;
              });

              $("#controller").on("touchmove", function(event){
                var targetEvent =  event.touches.item(0);
                socket.emit('move', {"dx" : targetEvent.clientX - startX , "dy": targetEvent.clientY - startY, "sessionHash": sessionHash});
                event.preventDefault();
              });
            }); // Touchable Scroll

          } else{
            socket.disconnect();
            alert('You have been disconnected. Wrong Key');
          }
        });

      }; // is Mobile 
      var isNotTouchable = function() {
        console.log('DESKTOP');
      }; // is Desktop 