jQuery.event.props.push("touches");
var socketUrl = 'http://' + location.hostname + ':9999';
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
        console.log("connected!");
        // Using modernizr feature detection for mobile touch events
        if(isMobileDevice){
          isTouchable();
        } else{
          isNotTouchable();
        }
      }); // main check

      var isTouchable = function(){
        var sessionHash = prompt('Please enter the code:');
        socket.emit('initiateController', {sessionHash: sessionHash});
        socket.on('controllerAuthorization', function (data) {
          if(data){
            alert('Authorized');
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
                  socket.emit('pinchIn', {"direction" : direction, "distance": distance, "zoomScale": pinchZoom, "sessionHash": sessionHash});
                },
                pinchIn: function(event, direction, distance, duration, fingerCount, pinchZoom) {
                  //socket.emit('pinchIn', {"direction" : direction, "distance": distance, "zoomScale": pinchZoom, "sessionHash": sessionHash});
                },
                pinchOut: function(event, direction, distance, duration, fingerCount, pinchZoom) {
                  //socket.emit('pinchOut', {"direction" : direction, "distance": distance, "zoomScale": pinchZoom, "sessionHash": sessionHash});
                },
                fingers: 2,
                allowPageScroll:"none",
                pinchThreshold:5
              });
            }); // Touchable jQuery

            //Touchable Scroll 
            $(function() {

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
                debugger;
                var targetEvent =  event.touches.item(0);
                socket.emit('move', {"dx" : Math.abs(startX - targetEvent.clientX), "dy": Math.abs(startY - targetEvent.clientY), "sessionHash": sessionHash});
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