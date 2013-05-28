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
                    api = api !== undefined ? api : window.$m.state.api;
                    return api+'?c='+controller+'&a='+action+'&'+
                        'auth='+$m.api.utils.getAuth()+'&'+
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
                getAuth: function () {
                    var timestamp = (new Date()).getTime();
                    var hash = $m.storage.get( 'hash' );
                    
                    if ( true || hash == '' ) {
                        if ( document.cookie.match( /(?:^|;)hash=/ ) ) {
                            hash = document.cookie.replace( /(?:^|.*;)hash=([^;]*)(?:;.*|$)/ , '$1' );
                        }
                    }
                
                    var auth = {
                        'Timestamp': timestamp ,
                        'Timestamp2': $m.storage.get( 'timestamp' ),
                        'AuthenticationHash': Sha256.hash( timestamp + hash ) ,
                    };
                    
                    return $m.api.utils.token( auth );
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
        
            ajax: function ( data , method , callback ) {
                var d = {};
                for ( var key in data ) {
                    if ( key.match(/^(c|a)$/) ) {
                        d[key] = data[key];
                        delete data[key];
                    }
                }
                
                d.token = $m.api.utils.token(data);
                //d.auth = Sha256.hash('abc');
                // Authentication hash generation :
                var timestamp = (new Date()).getTime();
                var hash = $m.storage.get( 'hash' );
                var auth = {
                    "Timestamp": timestamp ,
                    'Timestamp2': $m.storage.get( 'timestamp' ),
                    "AuthenticationHash": Sha256.hash( timestamp + hash ) ,
                };
                
                var api = data.api !== undefined ? data.api : window.$m.state.api;
                delete data.api;
                
                //$m.api.utils.abortAll();
                $m.query = $.ajax({
                    url: api + '?' + ( method.match(/DELETE/i) ? $.param( d ) : $.param( { a:d.a, c:d.c } ) ) + '&auth=' + $m.api.utils.token( auth ),
                    type: method,
                    data: d,
                    dataType: 'jsonp',
                    headers: auth,
                    crossDomain: true,
                    beforeSend: function(jqXHR) {
                        $m.api.xhrPool.push( jqXHR );
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
