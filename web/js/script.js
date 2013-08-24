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
            recents: [],        // Recents folders
            server: '',
            servers: {},        // Loaded servers
//            path: '/Images/Photos/2013/2013-03-02 Photos d\'essai au reflex'
            path: '',
            scale: 1,           // Main display scale
            api: 'api.php',
            thumbs: {},         // Album thumbnails
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

            // Configure AJAX request to use the cache handling method:
            // REF: http://stackoverflow.com/questions/9297873/is-it-possible-to-use-jquery-getscript-on-a-file-that-is-cached-with-a-cache-man
            $.ajaxSetup({
                cache: true
            });
        
            // Resources to load :
            $m.state.loading = jQuery.extend(true, [], $m.config.externals);
            
            // Addition of conditional resources :
            if ( $('#view-admin-panel').length ) $m.state.loading.push( 'js/plugins/admin.js' )
            
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
                                console.log( parameter + ' ' + typeof(v) , v );
                                if ( v !== null && v !== undefined ) $m[ type ][ parameter ] = v;
                                
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
                    $m.log( $m.state.servers );
                    for ( var s in $m.state.servers ) {
                        $m.addServer( $m.state.servers[s] );
                    }
                    if ( $m.state && $m.state.server ) {
                        var $li = $('#servers-dropdown .dropdown-menu li a[data-name="'+$m.state.server+'"]').parent();
                        $li.addClass('active').siblings('.active').removeClass('active');
                        if ( undefined !== $m.state.servers[$m.state.server] ) {
                            $('#servers-dropdown .dropdown-toggle img').attr('src',$m.api.utils.url('image','icon',{},$m.state.servers[$m.state.server].url));
                        }
                    }
                    
                    $m.state.tac = (new Date()).getTime();
                    $m.state.loadingTime = $m.state.tac - $m.state.tic;
                
                    $m.log( 'Loading finished :' );
                    $m.log( '- Loading duration : ' + $m.state.loadingTime + ' ms' );
                    $m.log( '- Resources loaded : ' + ( $m.config.externals.length + 1 ) );
                    
                    // Set current path 
                    var path = $m.state.path; //$m.state.path = '';
                    
                    setTimeout(function(){
                        $m.explorer.path( path );
                        
                        if ( $('#menu-dropdown a[href*=logout]').length ) {
                    
                            // Read Git/Github versions to offer update :
                            // TODO: Move this code to a proper function
                            $m.api.get({c:'github',a:'commits'},function( commits ){
                                $m.api.get({c:'github',a:'sha',api:'api.php'},function( j ){
                                    var sha = j.sha;
                                    var csha = $m.storage.get('state.sha');
                                    var releases = '';
                                    
                                    console.log('commits',commits,sha,csha);
                                    for ( var c = 0; c < commits.length; c++ ) {
                                        if ( commits[c].sha == sha ) break;
                                        if ( c > 10 ) { releases  += '...\n'; break; }
                                        releases += commits[c].commit.message+'\n';
                                    }
                                    
                                    console.log( releases );
                                    
                                    // Bind a cache update event:
                                    window.applicationCache.onupdateready = function(e) {
                                        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                                            $m.storage.set('state.sha',sha);
                                            // Browser downloaded a new app cache.
                                            // Swap it in and reload the page to get the new hotness.
                                            window.applicationCache.swapCache();
                                            if (confirm('New version available:\n'+releases+'\nLoad it?')) {
                                                window.location.reload();
                                            }
                                        } else {
                                            // Manifest didn't changed. Nothing new to server.
                                        }
                                    };
                                    
                                    // Current cached version is not synced with Github project:
                                    if ( commits.length && commits[0].sha !== sha ) {
                                        // Add a message to the main configuration panel
                                        $('.git-sha').parent().after('<li><a href="https://github.com/billou-fr/media-manager/commits/master" target="_blank" class="git-new-version" title="At the project root, execute the following command:\n>> git pull\n\n...or maybe you need to commit your code ">New version available !</a></li>');
                                        
                                        // Try to perform the auto-update process :
                                        $m.api.get({c:'github',a:'pull'},function( json ){
                                            console.log( '>>> UU: ' , json );
                                            
                                            if ( json && json.success ) {
                                                // Reset all cache data then reload:
                                                window.applicationCache.update(); // Attempt to update the user's cache.
                                                
                                            } else {
                                            
                                                // First time initialization:
                                                if ( null === csha ) $m.storage.set('state.sha',sha);
                                                else if ( csha !== sha ) {
                                                    
                                                    window.applicationCache.update(); // Attempt to update the user's cache.
                                                    
                                                }
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    },0);
                
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
        
        
        
        utils: {
            getWidth: function () {
                var width = 320;
            
                if ( $(window).width() < 320 ) width = $(window).width();
                else if ( $(window).width() < 480 ) width = $(window).width()/2;
                
                return width;
            },
            notify: function ( data ) {
                if ( data === undefined ) return true;
                
                data.img = data.img !== undefined ? data.img : './images/favicon.png';
                data.title = data.title !== undefined ? data.title : 'Mesh';
            
                var havePermission = window.webkitNotifications.checkPermission();
                
                if (havePermission == 0) {
                    if ( data.msg === undefined ) return true;
                
                    // 0 is PERMISSION_ALLOWED
                    var notification = window.webkitNotifications.createNotification(
                        data.img,
                        data.title,
                        data.msg
                    );
                    
                    notification.ondisplay = function(event) {
                        setTimeout(function() {
                            event.currentTarget.cancel();
                        }, 5000);
                    };

                    notification.onclick = function () {
                        window.open("http://stackoverflow.com/a/13328397/1269037");
                        notification.close();
                    }
                    notification.show();
                } else {
                    window.webkitNotifications.requestPermission();
                }
            },
        },
        
        
        
        removeServer: function ( name ) {
            // Removing entry in UI state:
            if ( undefined !== $m.state.servers[name] ) {
                delete $m.state.servers[name];
                $m.storage.set('state.servers',$m.state.servers);
            }
            
            $('#servers-dropdown .dropdown-menu li a[data-name="'+name+'"]').parent().remove();
            
            if ( $m.state.server == name ) {
                $('#servers-dropdown .dropdown-menu li.server:first a').click();
            }
        },
        editServer: function ( c ) {
            var n = true;
            var credentials = {
                name: '',
                url: '',
                login: '',
            };
            
            if ( undefined !== c ) {
                n = false;
                if ( typeof(c) === 'string' && $m.state.servers[c] ) credentials = $m.state.servers[c];
                else credentials = c;
            }
        
            $('#server-initialization').remove();
            $('body').append('<div id="server-initialization" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="server-initialization" aria-hidden="true">'+
                '<div class="modal-header">New server initialization</div>'+
                '<div class="modal-body">'+
                    '<form id="server-initialization-form">'+
                    '<div class="row-fluid">'+
                        '<input type="text" name="name" placeholder="Server name" class="span12"'+( n?'':' readonly="readonly"' )+' value="'+credentials.name+'"/>'+
                        '<input type="text" name="url" placeholder="Server URL (http://www.example.org/api.php)" class="span12" value="'+credentials.url+'"/>'+
                        '<input type="text" name="login" placeholder="Login" class="span12" value="'+credentials.login+'"/>'+
                        '<input type="password" name="password" placeholder="Password" class="span12" value=""/>'+
                    '</div>'+
                    '</form>'+
                '</div>'+
                '<div class="modal-footer">'+
                    ( n ? '' : '<button class="btn" data-dismiss="modal" aria-hidden="true" onClick="$m.removeServer(\''+credentials.name+'\');">Remove</button>' )+
                    '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                    '<button class="btn btn-primary" data-dismiss="modal" onClick="$m.addServer();">Save changes</button>'+
                '</div>'+
            '</div>');
            
            $('#server-initialization').modal('show');
        },
        addServer: function ( credentials ) {
        
            if ( undefined !== credentials ) {
                $item = $('<li class="server"><a data-name="'+credentials.name+'" title="Explore files on server" href="javascript:void(0);">'+
                    '<img class="img-circle" src="'+$m.api.utils.url('image','icon',{},credentials.url)+'">'+
                    '<span title="Go to this server" onclick="window.location = \''+credentials.url.replace(/index\.php/,'')+'\';" target="_top">'+credentials.name+'</span>'+
                    '<span class="btn btn-link" onClick="$m.editServer(\''+credentials.name+'\')"><i class="icon-edit"></i></span>'+
                '</a></li>');
                
                if ( $('#servers-dropdown .dropdown-menu li a[data-name="'+credentials.name+'"]').length ) {
                    $('#servers-dropdown .dropdown-menu li a[data-name="'+credentials.name+'"]').parent()
                        .after( $item ).remove();
                } else $('#servers-dropdown .dropdown-menu').append($item);
                
            } else {
                var $popup = $('#server-initialization');
                
                var credentials = {
                    name: $('*[name="name"]',$popup).val(),
                    url: $('*[name="url"]',$popup).val(),
                    login: $('*[name="login"]',$popup).val(),
                    timestamp: (new Date()).getTime(),
                }
                credentials.hash = $m.api.utils.generateHash([credentials.timestamp,credentials.login,$('*[name="password"]',$popup).val()]);
                
                //$m.api.get({},function( json ){ console.log(json); });
                
                if ( undefined !== $m.state.servers[credentials.name]
                    && $m.state.servers[credentials.name].url !== credentials.url
                    && !confirm('A server already exists with this name, are you sure you want to replace it ?') ) {
                    
                    $m.log('Server creation cancelled by user.');
                    
                } else {
                
                    if ( undefined !== $m.state.servers[credentials.name]
                        && $('*[name="password"]',$popup).val() == '' 
                        && credentials.login == $m.state.servers[credentials.name].login ) {
                        
                        credentials.timestamp = $m.state.servers[credentials.name].timestamp;
                        credentials.hash = $m.state.servers[credentials.name].hash;
                        
                    }
                
                    $m.addServer( credentials );
                
                    $m.state.servers[credentials.name] = credentials;
                    
                    $m.storage.set('state.servers',$m.state.servers);
                    
                    $item.click();
                
                }
                
                $popup.modal('hide');
                setTimeout(function(){$popup.remove();},500);
            }
            
            /*<a data-url="http://rasigade.fr:81/media-manager/api.php" title="Explore files on server" href="javascript:void(0);">
                <img class="img-circle" src="http://rasigade.fr:81/media-manager/images/server-icon.png">
                <span title="Go to this server" onclick="window.location = 'http://rasigade.fr:81/media-manager/index.php';" target="_top">server</span>
                <span class="btn btn-link"><i class="icon-remove"></i></span>
            </a>*/
        },
        
        
        // Private methods :
        
    });
    
    
    
    
    
    
    $(document).ready(function(){
        // Configuration initialization :
        $m.init();
    });
})(jQuery);
