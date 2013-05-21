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
//                    console.log( 'events', type, target, $m.events.binded[type][target] );
                    $.each( $m.events.binded[type][target] , function ( i , callback ) {
                        return callback( event );
                    });
                }
            },
        },
    });   
})(jQuery);