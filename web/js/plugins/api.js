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
        api: {
            xhrPool: [],
            utils: {
                abortAll: function() {
                    $($m.api.xhrPool).each(function(idx, jqXHR) {
                        jqXHR.abort();
                    });
                    $m.api.xhrPool.length = 0
                },
                url: function ( controller , action , token , api ) {
                
                    var credentials = {
                        url: api !== undefined ? api : window.$m.state.api,
                        timestamp: $m.storage.get( 'timestamp' ),
                        hash: $m.storage.get( 'hash' )
                    };
                    
                    if ( $m.state && $m.state.servers ) {
                        if ( $m.state.server && $m.state.servers[$m.state.server] ) {
                            credentials = $m.state.servers[$m.state.server];
                        }
                    }
                
                    api = api !== undefined ? api : window.$m.state.api;
                    return api+'?c='+controller+'&a='+action+'&'+
                        'auth='+$m.api.utils.getAuth( credentials )+'&'+
                        'token='+$m.api.utils.token(token);
                },
                // Read / Write token based on data type.
                token: function( data ) {
                
                    if ( typeof( data ) == 'string' ) {
                        return $.parseJSON( Base64.decode( data ) );
                    } else {
                        return Base64.encode( JSON.stringify( data ) );
                    }
                },
                generateHash: function ( data ) {

                    // Hash generation :
                    var hash = Sha256.hash( data.join('|') );
                    
                    return hash;
                },
                getAuth: function ( credentials ) {
                    var timestamp = (new Date()).getTime();
                    var hash = credentials !== undefined && credentials.hash ? credentials.hash : $m.storage.get( 'hash' );
                    
                    if ( hash == '' ) {
                        if ( document.cookie.match( /(?:^|;)hash=/ ) ) {
                            hash = document.cookie.replace( /(?:^|.*;)hash=([^;]*)(?:;.*|$)/ , '$1' );
                        }
                    }
                
                    var auth = {
                        'Timestamp': timestamp ,
                        'Timestamp2': credentials !== undefined && credentials.timestamp ? credentials.timestamp : $m.storage.get( 'timestamp' ),
                        'AuthenticationHash': Sha256.hash( timestamp + hash ) ,
                    };
                    
                    return $m.api.utils.token( auth );
                },
                authenticate: function () {
                    if ( $m.state.server && $m.state.servers[$m.state.server] ) {
                        var credentials = $m.state.servers[$m.state.server];
                        credentials.timestamp = (new Date()).getTime();
                        credentials.hash = $m.api.utils.generateHash([credentials.timestamp,credentials.login,$('#server-authentication *[name="password"]').val()]);
                        
                        $m.state.servers[credentials.name] = credentials;
                        $m.storage.set('state.servers',$m.state.servers);
                    }
                },
                fileCount: function ( json ) {
                    var count = 0;
                    for ( var type in json ) {
                        for ( var i in json[type] ) {
                            count++;
                        }
                    }
                    return count;
                },
            },
        
            errors: {
                0: function () {
                    if ( $('#menu-dropdown a[href*=logout]').length ) {
                        if ( $m.state.server == 'local' ) {
                            //window.location = $('#menu-dropdown a[href*=logout]').attr('href');
                        } else $m.api.errors[401]();
                    }
                },
                403: function () {
                    console.error(403,'Forbidden >> reloading page');
                    
                    if ( !window.location.href.match('/login.php/') ) {
                        // Reloading page redirect to login page:
//                                window.location = window.location;
                        if ( $('#menu-dropdown a[href*=logout]').length ) {
                            //window.location = $('#menu-dropdown a[href*=logout]').attr('href');
                            //if ( typeof(callback) == 'function' ) callback( 403 );
                        }
                    }
                },
                401: function () {// User credentials expired
                    $m.log('Login expired');
                    
                    if ( $('#menu-dropdown a[href*=logout]').length && $m.state.server && $m.state.servers[$m.state.server] ) {
                        var credentials = $m.state.servers[$m.state.server];
                    
                        var $popup = $('#server-authentication');
                        
                        if ( $popup.length == 0 ) {
                            $('body').append('<div id="server-authentication" class="modal hide fade server-authentication" tabindex="-1" role="dialog" aria-labelledby="server-initialization" aria-hidden="true">'+
                                '<div class="modal-header">Server '+$m.state.server+' authentication</div>'+
                                '<div class="modal-body">'+
                                    '<form id="server-initialization-form">'+
                                    '<div class="row-fluid">'+
                                        '<input type="text" name="login" placeholder="Login" class="span12" readonly="readonly" value="'+credentials.login+'"/>'+
                                        '<input type="password" name="password" placeholder="Password" class="span12" value=""/>'+
                                    '</div>'+
                                    '</form>'+
                                '</div>'+
                                '<div class="modal-footer">'+
                                    '<button class="btn btn-primary" data-dismiss="modal" onClick="$m.api.utils.authenticate();">Submit</button>'+
                                '</div>'+
                            '</div>');
                        } else {
                            $('.model-header',$popup).text( 'Server '+$m.state.server+' authentication' );
                            $('*[name="login"]',$popup).val(credentials.login);
                            $('*[name="password"]',$popup).val('');
                        }
                        
                        $('#server-authentication').modal('show');
                    }
                }
            },
            ajax: function ( data , method , callback ) {
                var d = {};
                for ( var key in data ) {
                    if ( key.match(/^(c|a|p)$/) ) {
                        d[key] = data[key];
                        delete data[key];
                    }
                }
                
                d.token = $m.api.utils.token(data);
                
                var credentials = {
                    url: data.api !== undefined ? data.api : window.$m.state.api,
                    timestamp: $m.storage.get( 'timestamp' ),
                    hash: $m.storage.get( 'hash' )
                };
                
                if ( $m.state && $m.state.servers ) {
                    if ( $m.state.server && $m.state.servers[$m.state.server] ) {
                        credentials = $m.state.servers[$m.state.server];
                    }
                }
                
                //d.auth = Sha256.hash('abc');
                // Authentication hash generation :
                var auth = $m.api.utils.getAuth( credentials );
                
                var api = data.api !== undefined ? data.api : window.$m.state.api;
                delete data.api;
                
                //$m.api.utils.abortAll();
                $m.query = $.ajax({
                    url: api + '?' + ( method.match(/DELETE/i) ? $.param( d ) : $.param( { a:d.a, c:d.c } ) ) + '&auth=' + auth,
                    type: method,
                    data: d,
                    dataType: 'jsonp',
                    headers: $m.api.utils.token( auth ),
                    timeout : 5000,
                    //crossDomain: true,
                    beforeSend: function( request ) {
                        $m.api.xhrPool.push( request );
                        
//                        request.setRequestHeader("Authority", $m.api.utils.token( auth ) );
                    },
                    /*statusCode: {
                        403: $m.api.errors['403'],
                        401: $m.api.errors['401'],
                    },*/
                    error: function( xhr, textStatus ) {
                        console.error( xhr , textStatus );
                        
                        if ( typeof($m.api.errors[xhr.status]) == 'function' ) $m.api.errors[xhr.status]();
                        //else $m.api.errors[401]();
                    },
                    success: function ( json ) {
                        if ( typeof(callback) == 'function' ) callback(json);
                        delete $m.query;
                    }
                });
            },
            get: function ( data , callback ) { $m.api.ajax(data,'GET',callback); },
            post: function ( data , callback ) { $m.api.ajax(data,'POST',callback); },
            put: function ( data , callback ) { $m.api.ajax(data,'PUT',callback); },
            delete_: function ( data , callback ) { $m.api.ajax(data,'DELETE',callback); },
        },
    });   
})(jQuery);
