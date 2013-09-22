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
        events: {
            binded: {
                //'click': [ 'window' ],
                /*'mousedown': [ 'window' ],
                'mousemove': [ 'window' ],
                'mouseup': [ 'window' ],
                'mouseout': [ 'window' ],
                'mousewheel': [ 'window' ],
                'scroll': [ 'window' ],
                'focus': [ 'window' ],
                'blur': [ 'window' ], // Window focused state update.
                'dragstart': [ 'window' ],
                'dragover': [ 'window' ],
                'dragend': [ 'window' ],
                'drop': [ 'window' ]*/
            },
            bind: function ( type , target , callback ) {
                var $elt = undefined;
                switch ( target ) {
                    case 'document':
                        $elt = $( document ); break;
                    case 'window':
                        $elt = $( window ); break;
                    default:
                        $elt = $( target ); break;
                }
                
                console.warn( 49 , type , target );
                
                if ( $elt ) {
                    if ( !$m.events.binded[type] ) $m.events.binded[type] = {};
                    if ( !$m.events.binded[type][target] ) $m.events.binded[type][target] = [];
                    
                    if ( typeof(callback) == 'function' ) $m.events.binded[type][target].push( callback );
                    
                    if ( !$elt.data( type+'.$m') )
                        $elt.data( type+'.$m' , true )
                            .bind( type+'.$m' , { type: type , target: target } , $m.events.trigger );
                }
            },
            trigger: function ( event ) {
                var type = event.data.type;
                var target = event.data.target;
                if ( $m.events.binded[type] && $m.events.binded[type][target] ) {
                    
                    var f = [function( triggered ){
                        if ( !$m.events.binded[type][target].triggered ) {
                            if ( triggered !== false ) {
                                $m.events.binded[type][target].triggered = true;
                            }
                            
                            
        //                    console.log( 'events', type, target, $m.events.binded[type][target] );
                            $.each( $m.events.binded[type][target] , function ( i , callback ) {
                                console.log( type , 'events' , target , i , $m.events.binded[type][target].length );
                                return callback( event );
                            });
                            
                            if ( triggered !== false ) {
                                setTimeout(function(){ $m.events.binded[type][target].triggered = false; }, 100 );
                            }
                        }
                    }];
                    
                    if ( !type.match(/(drag|drop)/) ) setTimeout(function(){ f[0](true); },15);
                    else f[0](false);
                    
                    return true;
                }
            },
        },
    });
    
    
    // Swipe triggering:
    /*
    $(window).bind('touchstart mousedown',function(event){
        if ( event.originalEvent.touches && event.originalEvent.touches.length > 0 ) {
            event.pageX = event.originalEvent.touches[0].pageX;
            event.pageY = event.originalEvent.touches[0].pageY;
        }
    
        $m.state.touch = {
            startX: parseFloat(event.pageX),
            startY: parseFloat(event.pageY)
        }
    })
    .bind('touchmove touchcancel',function(event){
    
        if ( event.originalEvent.touches && event.originalEvent.touches.length > 0 ) {
            event.pageX = event.originalEvent.touches[0].pageX;
            event.pageY = event.originalEvent.touches[0].pageY;
        }
        
        $m.state.touch.diffX = parseFloat(event.pageX) - $m.state.touch.startX;
        $m.state.touch.diffY = parseFloat(event.pageY) - $m.state.touch.startY;
    
        event.preventDefault();
    })
    .bind('touchend mouseup',function(event){
        if ( undefined === $m.state.touch.diffX ) {
            $m.state.touch.diffX = parseFloat(event.pageX) - $m.state.touch.startX;
            $m.state.touch.diffY = parseFloat(event.pageY) - $m.state.touch.startY;
        }
    });
    */
})(jQuery);
