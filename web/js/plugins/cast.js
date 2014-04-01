/* ===================================================
 * Media Manager v0.1
 * https://github.com/billou-fr/Mesh/
 * ===================================================
 * Copyright 2013 Gilles Rasigade
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        cast: {

            config: {
                id: null
            },

            _session: null,
            _timer: null,
            _media: null,

            ns: '$m',// Storage application namespace:
        
            // REF: https://developers.google.com/cast/docs/chrome_sender
            init: function() {

                // Add the loaded callbacl
                window['__onGCastApiAvailable'] = $m.cast.googleCastAvailable;

                // Load the Google Cast SDK:
                $.getScript('https://www.gstatic.com/cv/js/sender/v1/cast_sender.js',function(){

                    console.log( 'Google Cast SDK loaded' );

                })

            },

            isConnected: function() { return Boolean( $m.cast._session ); },

            // Google Cast is available:
            googleCastAvailable: function ( loaded , errorInfo ) {
                if (loaded) {

                    // If no error has been raised, initialize it:
                    $m.cast.initializeCastApi();

                } else {
                    console.log( 'cast' , errorInfo);
                }
            },

            initializeCastApi: function() {
                // Get a unique session request:
                var sessionRequest = new chrome.cast.SessionRequest( chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID );

                console.log( 'cast' , sessionRequest );

                // Api configuration for using the Google Cast:
                var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                    $m.cast.sessionListener,
                    $m.cast.receiverListener);

                chrome.cast.initialize(apiConfig, $m.cast.onInitSuccess, $m.cast.onError);
            },

            stopApp: function() {

                var onStopAppSuccess = function() {
                    console.log( 'cast' , 'application stopped' )
                }

              $m.cast._session.stop(onStopAppSuccess, $m.castonError);
              if( $m.cast._timer ) {
                clearInterval($m.cast._timer);
              }
            },

            onInitSuccess: function() {
                $('#menu-google-cast').show();
                console.log( 'cast' , 'Cast init success');
            },
            onError: function() { console.log( 'cast' , 'Cast error' , arguments ); },

            sessionListener: function (e) {
                console.log( 'cast' , 'New session ID: ' + e.sessionId);
                $m.cast._session = e;

                $('.icon-google-cast').removeClass('idle').addClass('active')

                if ($m.cast._session.media.length != 0) {
                    console.log( 'cast' , 
                        'Found ' + $m.cast._session.media.length + ' existing media sessions.');
                        $m.cast.onMediaDiscovered('sessionListener', $m.cast._session.media[0]);
                }
                $m.cast._session.addMediaListener(
                    $m.cast.onMediaDiscovered.bind(this, 'addMediaListener'));

                $m.cast._session.addUpdateListener($m.cast.sessionUpdateListener.bind(this));  
            },

            requestSession: function(e) {
                var onRequestSessionSuccess = function(e) {
                    console.log('cast', "session success: " + e.sessionId);
                    $m.cast._session = e;

                    $('.icon-google-cast').removeClass('idle').addClass('active')

                    $m.cast._session.addUpdateListener($m.cast.sessionUpdateListener.bind(this));  
                      if ($m.cast._session.media.length != 0) {
                        $m.cast.onMediaDiscovered('onRequestSession', $m.cast._session.media[0]);
                      }
                      $m.cast._session.addMediaListener(
                        $m.cast.onMediaDiscovered.bind(this, 'addMediaListener'));
                      $m.cast._session.addUpdateListener($m.cast.sessionUpdateListener.bind(this));

                      //$m.cast.loadMedia();
                }

                chrome.cast.requestSession( onRequestSessionSuccess, $m.cast.onError );
            },

            receiverListener: function (e) {
              if( e === 'available' ) {
                console.log( 'cast' , "receiver found");
              }
              else {
                console.log( 'cast' , "receiver list empty");
              }
            },

            onMediaDiscovered: function (how, media) {

                console.log( 'cast' , how , media );

                var onMediaStatusUpdate = function (isAlive) {
                  if( false && progressFlag ) {
                    document.getElementById("progress").value = parseInt(100 * currentMedia.currentTime / currentMedia.media.duration);
                    document.getElementById("progress_tick").innerHTML = currentMedia.currentTime;
                    document.getElementById("duration").innerHTML = currentMedia.media.duration;
                  }
                  //document.getElementById("playerstate").innerHTML = currentMedia.playerState;
                }

                $m.cast._media = media;
              
              console.log( 'cast' , "new media session ID:" + media.mediaSessionId + ' (' + how + ')');
              $m.cast._media = media;
              $m.cast._media.addUpdateListener(onMediaStatusUpdate);
              mediaCurrentTime = $m.cast._media.currentTime;
              //playpauseresume.innerHTML = 'Play';
              /*document.getElementById("casticon").src = 'images/cast_icon_active.png'; 
              if( !$m.cast._timer ) {
                $m.cast._timer = setInterval(updateCurrentTime.bind(this), 1000);
                playpauseresume.innerHTML = 'Pause';
              }*/
            },

            sessionUpdateListener: function (isAlive) {
              var message = isAlive ? 'Session Updated' : 'Session Removed';
              message += ': ' + $m.cast._session.sessionId;
              console.log( 'cast' , message);

              if (!isAlive) {
                $m.cast._session = null;
                //document.getElementById("casticon").src = 'images/cast_icon_idle.png'; 
                //var playpauseresume = document.getElementById("playpauseresume");
                //playpauseresume.innerHTML = 'Play';

                $('.icon-google-cast').addClass('idle').removeClass('active');

                if( $m.cast._timer ) {
                  clearInterval($m.cast._timer);
                }
                else {
                  $m.cast._timer = setInterval($m.cast.updateCurrentTime.bind(this), 1000);
                  //playpauseresume.innerHTML = 'Pause';
                }
              } else {
                $('.icon-google-cast').removeClass('idle').addClass('active')
              }
            },

            loadMedia: function ( url , contentType ) {
              if (!$m.cast._session) {
                console.log('cast',"no session");
                return;
              }

              // Default media content type:
              contentType = contentType || 'video/mp4';

              // url = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
              // url = 'http://rasigade.fr:81/media-manager/api.php?c=image&a=access&auth=eyJUaW1lc3RhbXAiOjE0Mjc4ODI3OTk1MDgsIlRpbWVzdGFtcDIiOiIvSW1hZ2VzL1Bob3Rvcy8yMDEzLzIwMTMtMDEtMjAgTmVpZ2Ugc3VyIFBhcmlzL0lNR183MTI3LkpQRyIsIkF1dGhlbnRpY2F0aW9uSGFzaCI6ImRiM2MyNGNlNWRjNTQ2ZjJmNTVjMTIwMmRmMDQzYjU3N2RkZjg3MjVkZGZiYWRmNGFjM2MxOWI0NThjZDFmZWIifQ==&token=eyJwYXRoIjoiL0ltYWdlcy9QaG90b3MvMjAxMy8yMDEzLTAxLTIwIE5laWdlIHN1ciBQYXJpcy9JTUdfNzEyNy5KUEciLCJtb2RlIjoicHJldmlldyIsImJhc2U2NCI6ZmFsc2UsInNoYXJlZCI6dHJ1ZX0=';
              // url = 'http://rasigade.fr:81/media-manager/api.php?c=video&a=access&auth=eyJUaW1lc3RhbXAiOjEzOTYzNDkzNTkzMzgsIlRpbWVzdGFtcDIiOiIxMzk2MzQ5MjQxMjIyIiwiQXV0aGVudGljYXRpb25IYXNoIjoiMDVjYjZkZDQ5YjhhMTFkYzg1MTBjYWZjYmNkMTVkZWNkYmI0NjJhYTg3YWM3MTlkMmNiZjYyZWE3NGI0ODM3YiJ9&token=eyJwYXRoIjoiL0ltYWdlcy9UcmFuc2ZlcnQvR0FNRSBPRiBUSFJPTkVTL3MyL0dhbWUub2YuVGhyb25lcy5TMDJFMDguNzIwcC5IRFRWLngyNjQtVk9TVC5ta3YifQ=='
              // url = 'http://rasigade.fr:81/media-manager/' + $m.api.utils.url( 'video' , 'access' , { path: '/Videos/film/La belle et La bete.mp4' });
              // url = 'http://rasigade.fr:81/media-manager/' + $m.api.utils.url( 'video' , 'access' , { path: '/Images/Transfert/GAME OF THRONES/s2/Game.of.Thrones.S02E01.720p.HDTV.x264-VOST.mkv' });

              console.log('cast',"loading..." + url );
              var mediaInfo = new chrome.cast.media.MediaInfo(url);
              mediaInfo.contentType = contentType;
              var request = new chrome.cast.media.LoadRequest(mediaInfo);
              request.autoplay = true;
              request.currentTime = 0;

              console.log( "cast" , mediaInfo , request );
              
              //var payload = {
              //  "title:" : mediaTitles[i],
              //  "thumb" : mediaThumbs[i]
              //};

              //var json = {
              //  "payload" : payload
              //};

              //request.customData = json;

              $m.cast._session.loadMedia(request,
                $m.cast.onMediaDiscovered.bind(this, 'loadMedia'),
                $m.cast.onError);

            },

            mediaCommandSuccessCallback: function() {
                console.log( 'cast' , arguments );
            },

            playMedia: function () {
              if( !$m.cast._media ) 
                return;

              if( $m.cast._timer ) { clearInterval($m.cast._timer); }

              console.log( 'cast' , 'playing' );

                $m.cast._media.play(null,
                  $m.cast.mediaCommandSuccessCallback.bind(this,"playing started for " + $m.cast._media.sessionId),
                  $m.cast.onError);
                  $m.cast._timer = setInterval($m.cast.updateCurrentTime.bind(this), 1000);
              },

              pauseMedia: function() {

                if( !$m.cast._media ) 
                return;

              if( $m.cast._timer ) { clearInterval($m.cast._timer); }

              console.log( 'cast' , 'pausing' );
              
              $m.cast._media.pause(null,
                $m.cast.mediaCommandSuccessCallback.bind(this,"paused " + $m.cast._media.sessionId),
                $m.cast.onError);
            },

            stopMedia: function() {

                if( !$m.cast._media ) 
                return;

              if( $m.cast._timer ) { clearInterval($m.cast._timer); }

              console.log( 'cast' , 'pausing' );
              
              $m.cast._media.stop(null,
                $m.cast.mediaCommandSuccessCallback.bind(this,"stopped " + $m.cast._media.sessionId),
                $m.cast.onError);
            },

            updateCurrentTime: function() {},
        }
    });
    
    // File System storage initialization:
    $m.cast.init();
    
})(jQuery);
