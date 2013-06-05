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
            path: '',
            api: 'api.php'
        },
        
        
        // Media server configuration :
        config: {
            columns: 1,
            views: [],      // List of possible views
            externals: [
                'external/js/base64.js',
                'external/js/sha256.js',
            
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
        
        
        // Public methods :
        log: function ( message ) { if ( $m.state.debug ) console.log( message ); },
        init: function () {
        
            // Resources to load :
            $m.state.loading = jQuery.extend(true, [], $m.config.externals);
            
            // Tic Tac computation :
            $m.state.tic= (new Date()).getTime();
            
            // Loading started :
            $m.log( 'Loading started...' );
        
            // Asynchronous initialization process :
            var f = [
                // External resources loading :
                function () {
                    if ( $m.state.loading.length > 0 ) {
                    
                        $m.log( '> Loading : ' + $m.state.loading[0] );
                        $m.loadExternalResource( $m.state.loading[0] , function(){
                            $m.state.loading.shift(); f[0]();
                        });
                        
                    } else {
                    
                        delete $m.state.loading; f[1]();
                        
                    }
                },
                // User Interface configuration loading :
                function () {
                
                    $m.log( '> Loading UI parameters' );
                    // Loop on all possible UI configuration parameters :
                    for ( var type in { config:1 , state:1 } ) {
                        if ( $m[type] !== undefined ) {
                            for ( var parameter in $m[type] ) {
                                var v = $m.storage.get( type+'.'+parameter );
                                console.log( parameter + ' ' + typeof(v) );
                                if ( v !== null && v!== undefined ) $m[ type ][ parameter ] = v;
                                
                                console.log( type+'.'+parameter+': '+$m[ type ][ parameter ] );
                            }
                        }
                    }
                    
                    f[2]();
                },
                // Events binding :
                function () {
                    // URL parameters reading :
//                    var p = window.location.search.replace(/^\?/,'').split('&');
//                    $m.url = {};
//                    for ( var i in p ) $m.url[ p[i].replace(/=.*$/,'') ] = p[i].replace(/[^=]+=/,'');
                    
                    f[3]();
                },
                // Finalization :
                function () {
                    
                    $m.log( '> Servers dropdown update' );
                    // 
                    $server = $('#servers-dropdown .dropdown-menu a[data-url="'+$m.state.api+'"]').closest('li');
                    if ( $server.length ) {
                        $server.addClass('active').siblings('.active').removeClass('active');
                        //$('#servers-dropdown .dropdown-toggle').empty().append( $server.find('img').clone() );
                        $('#servers-dropdown .dropdown-toggle').addClass('server').css( 'background-image' , 'url("'+$server.find('img').attr('src')+'")' )
                            .empty().html('<i class="icon-caret-down">&nbsp;</i>');
                    }
                    
                    $m.state.tac = (new Date()).getTime();
                    $m.state.loadingTime = $m.state.tac - $m.state.tic;
                
                    $m.log( 'Loading finished :' );
                    $m.log( '- Loading duration : ' + $m.state.loadingTime + ' ms' );
                    $m.log( '- Resources loaded : ' + ( $m.config.externals.length + 1 ) );
                    
                    // Set current path 
                    var path = $m.state.path; //$m.state.path = '';
                    
                    $m.explorer.path( path );
                    
                    // Read Git/Github versions to offer update :
                    $m.api.get({c:'github',a:'commits'},function( commits ){
                        var sha = $('.git-sha').text().trim();
                        if ( commits.length && commits[0].sha !== sha ) {
                            $('.git-sha').after(' | <a href="https://github.com/billou-fr/media-manager/commits/master" target="_blank" class="git-new-version" title="At the project root, execute the following command:\n>> git pull\n\n...or maybe you need to commit your code ">New version available !</a>');
                            
                            // Perform the auto-update process :
//                            $m.api.get({c:'github',a:'pull'},function( json ){
//                                if ( json.success ) location.reload();
//                            });
                        }
                        
                    });
                
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
