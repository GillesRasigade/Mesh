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
    // Main object initialization
    window.$m = $.extend( window.$m !== undefined ? window.$m : {} , {
    
        // List of states for the UI :
        state: {
            debug: true,
            focused: true,      // Window focus (used for desktop notifications)
            plugins: [],        // Loaded modules
//            path: '/Images/Photos/2013/2013-03-02 Photos d\'essai au reflex'
            path: ''
        },
        
        
        // Media server configuration :
        config: {
            columns: 1,
            views: [],      // List of possible views
            externals: [
                'js/utils/utils.js',
            
                'js/plugins/events.js',
                'js/plugins/storage.js',
                'js/plugins/api.js',
                'js/plugins/utils.js',
                
                'js/plugins/explorer.js',
                'css/plugins/explorer.css',
                
                
                'js/plugins/views/folder.js',
                'css/plugins/folder.css',
                
                'js/plugins/views/image.js',
                'css/plugins/image.css',
                
                'js/plugins/views/music.js',
                'css/plugins/music.css',
                
                'js/plugins/views/pdf.js',
                'css/plugins/pdf.css',
                
                'js/plugins/views/card.js',
                'css/plugins/card.css',
                
                'js/plugins/views/video.js',
                'css/plugins/video.css',
            ],
        },
        url: {
            current: window.location.href.replace(/\?#.*$/,''),
            api: window.location.href.replace(/\/[^\/]*$/,'/api.php')
        },
        
        
        // Public methods :
        log: function ( message ) { if ( $m.state.debug ) console.log( message ); },
        init: function () {
            // Resources to load :
            $m.state.loading = jQuery.extend(true, [], $m.config.externals);
            
            // Tic Tac computation :
            $m.state.tic= (new Date()).getTime();
        
            // Asynchronous initialization process :
            var f = [
                // External resources loading :
                function () {
                    if ( $m.state.loading.length > 0 ) {
                    
                        $m.loadExternalResource( $m.state.loading[0] , function(){
                            $m.state.loading.shift(); f[0]();
                        });
                        
                    } else {
                    
                        delete $m.state.loading; f[1]();
                        
                    }
                },
                // User Interface configuration loading :
                function () {
                    // Loop on all possible UI configuration parameters :
                    for ( var type in { config:1 , state:1 } ) {
                        if ( $m[type] !== undefined ) {
                            for ( var parameter in $m[type] ) {
                                var v = $m.storage.get( type+'.'+parameter );
                                if ( v !== null ) $m[ type ][ parameter ] = v;
                            }
                        }
                    }
                    
                    f[2]();
                },
                // Events binding :
                function () {
                    /*for ( var event in $m.events ) {
                        for ( var i in $m.events[event] ) {
                            var target = $m.events[event][i];
                            var $elt = undefined;
                            switch ( target ) {
                                case 'document':
                                    $elt = $( document ); break;
                                case 'window':
                                    $elt = $( window ); break;
                                default:
                                    $elt = $( target ); break;
                            }
                            
                            if ( $elt )
                                $elt.bind( event+'.$m' , { type: event } , $m.event);
                        }
                    }*/
                    
                    //$m.events.bind( 'click' , 'window' , function( event ) { alert('okok'); });
                    
                    f[3]();
                },
                // Finalization :
                function () {
                
                    $m.state.tac = (new Date()).getTime();
                    $m.state.loadingTime = $m.state.tac - $m.state.tic;
                
                    $m.log( 'Loading finished :' );
                    $m.log( '- Loading duration : ' + $m.state.loadingTime + ' ms' );
                    $m.log( '- Resources loaded : ' + ( $m.config.externals.length + 1 ) );
                    
                    // Set current path 
                    var path = $m.state.path; //$m.state.path = '';
                    $m.explorer.path( path );
                
                }
            ]; f[0]();
        },
        
        
        loadExternalResource: function ( src , callback ) {
            switch ( true ) {
                
                // CSS file loading :
                case src.match( /\.css$/ ) !== null:
                    $('<link rel="stylesheet" type="text/css" href="'+src+'" />').appendTo("head");
                    if ( typeof(callback) == 'function' ) callback();
                    break;
                
                // Javascript file loading :
                case src.match( /\.js$/ ) !== null:
                    $.getScript( src , function () {
                        if ( typeof(callback) == 'function' ) callback();
                    });
                    break;
                    
            }
        },
        
        
        // Private methods :
        
    });
    
    
    
    
    
    
    $(document).ready(function(){
        // Configuration initialization :
        $m.init();
    });
})(jQuery);
