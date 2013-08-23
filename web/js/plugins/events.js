/* ===================================================
 * Media Manager v0.1
 * https://github.com/billou-fr/media-manager/
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
                    
                    var f = [function(){
                        if ( !$m.events.binded[type][target].triggered ) {
                            $m.events.binded[type][target].triggered = true;
                            
                            
        //                    console.log( 'events', type, target, $m.events.binded[type][target] );
                            $.each( $m.events.binded[type][target] , function ( i , callback ) {
                                console.log( 'events' , type , target , i , $m.events.binded[type][target].length );
                                return callback( event );
                            });
                            
                            setTimeout(function(){ $m.events.binded[type][target].triggered = false; }, 100 );
                        }
                    }];
                    
                    if ( !type.match(/(drag|drop)/) ) setTimeout(f[0],15);
                    else f[0]();
                    
                    return true;
                }
            },
        },
    });   
})(jQuery);
