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
                
                'js/plugins/app.js',
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
            var i = 0, f = [
                // External resources loading :
                function () {
                    if ( $m.state.loading.length > 0 ) {
                    
                        $m.log( '> Loading : ' + $m.state.loading[0] );
                        $m.loadExternalResource( $m.state.loading[0] , function(){
                            $m.state.loading.shift(); f[i]();
                        });
                        
                    } else {
                    
                        delete $m.state.loading; f[++i]();
                        
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
                    
                    f[++i]();
                },
                // Events binding :
                function () {
                
                    // OpenId login:
                    if ( window.openId ) {
                        $m.state.hash = openId.hash = $m.api.utils.generateHash([openId.timestamp,openId.login,openId.i]);
                        $m.state.timestamp = openId.timestamp;
                        $m.storage.set( 'hash' , openId.hash );
                        $m.storage.set( 'timestamp' , openId.timestamp );
                        console.log( openId.i );
                        
                        //console.log( servers );
                        $m.state.servers['local'] = {
                            name: 'local',
                            url: window.location.pathname.replace(/\/[^\/]+$/,'/api.php'),    
                            login: openId.login,
                            timestamp: openId.timestamp,
                            hash: openId.hash
                        }
                        console.log( $m.state.servers );
                        $m.storage.set('state.servers',$m.state.servers);
                        console.log( $m.storage.get('state.servers') );
                    }
                
                    // URL parameters reading :
//                    var p = window.location.search.replace(/^\?/,'').split('&');
//                    $m.url = {};
//                    for ( var i in p ) $m.url[ p[i].replace(/=.*$/,'') ] = p[i].replace(/[^=]+=/,'');
                    
                    f[++i]();
                },
                function () {
                    // Read parameter link:
                    if ( window.location.href.match(/link=/) && undefined === $m.shared ) {
                        var link = window.location.href.replace(/^.*link=([^&]*).*$/,'$1');
                        var token = $m.api.utils.token( link );
                        if ( token.shared === true ) {
                            // Removing UI elements:
                            $('body').addClass('anonymous');
                        
                            $m.loadExternalResource( 'css/plugins/anonymous.css' );
                        
                            // Setting up anonymous connection settings:
                            $m.state.path = token.path;
                            $m.shared = token.path;
                            $m.state.servers = {
                                local: {
                                    name: token.path.replace(/.*\//,''),
                                    url: token.url,
                                    login: 'Anonymous',
                                    timestamp: token.path,
                                    hash: token.auth,
                            }};
                            $m.state.server= 'local';
                            $m.state.api = token.url;
                            //delete $m.events.binded['click']['#explorer-tree-nav'];
                            
                            
                        }
                        
                        // Don't know why this line is required...
                        $m.api.get({c:'app',a:'init'},function(json){});
                        setTimeout(f[i],250);
                        
                    } else {
                
                        // Loading external user and application configuration:
                        $m.api.get({c:'app',a:'init',api:'api.php'},function(json){
                            console.log( 171 , json );
                            
                            // Update the lateral menu:
                            $('#menu-dropdown .icon-user').attr('title',json.user.login);
                            
                            // Update UI with input data:
                            if ( json.user.admin ) {
                                $('#menu-dropdown .dropdown-menu .divider.a').before('<li class="divider"></li>'+
                                '<li><a href="javascript:$m.app.panel();" id="view-admin-panel"><i class="icon-wrench"></i> Configuration</a></li>');
                            }
                            
                            // OpenId authentication:
                            if ( json.openId ) {
                                window.openId = json.openId;
                            
                                $m.state.hash = openId.hash = $m.api.utils.generateHash([openId.timestamp,openId.login,openId.i]);
                                $m.state.timestamp = openId.timestamp;
                                $m.storage.set( 'hash' , openId.hash );
                                $m.storage.set( 'timestamp' , openId.timestamp );
                                console.log( openId.i );
                                
                                //console.log( servers );
                                $m.state.servers['local'] = {
                                    name: 'local',
                                    url: window.location.pathname.replace(/\/[^\/]+$/,'/api.php'),
                                    login: openId.login,
                                    timestamp: openId.timestamp,
                                    hash: openId.hash
                                }
                                console.log( $m.state.servers );
                                $m.storage.set('state.servers',$m.state.servers);
                                console.log( $m.storage.get('state.servers') );
                            }
                            
                            f[++i]();
                        });
                    }
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
                    
                            // Main application update:
                            $m.app.update();
                            
                        }
                    },0);
                
                }
            ]; f[i]();
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
            
                if ( $(window).width() <= 320 ) width = $(window).width();
                else if ( $(window).width() <= 480 ) width = $(window).width()/2;
                
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
                    '<span title="Go to this server" onclick="window.location = \''+credentials.url.replace(/api\.php/,'')+'\';" target="_top">'+credentials.name+'</span>'+
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
                credentials.share = $m.api.utils.generateHash([0,credentials.login,$('*[name="password"]',$popup).val()]);
                
                // Convert relative URLs to absolute ones:
                if ( !credentials.url.match(/^https?:\/\//) ) {
                    credentials.url = credentials.url.replace( /^.*\?/ , window.location.href.replace(/\?.*$/,'') + '?' );
                }
                
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
                        credentials.share = $m.state.servers[credentials.name].share;
                        
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
    });
    
    
    
    
    
    
    $(document).ready(function(){
        // Configuration initialization :
        $m.init();
    });
})(jQuery);
