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
        storage: {
            // Set a parameter as a JSON value in the localStorage or as a cookie if not supported :
            set: function ( key , value ) {
                
                if ( value !== undefined ) {
            
                    // Update the media configuration or state value :
                    ns = key.split('.');
                    if ( ns.length > 1 ) $m[ns[0]][ns[1]] = value;

                    // Replacement of the parameter key to prefix it with the project namespace :
                    key = '$m.' + key;
    //                eval( key + ' = ' + value );

                    // JSON value stringify :
                    value = JSON.stringify( value );

                    console.log( 'storage.set' , key , value );

                    // Store the value :
                    if ( window.localStorage ) window.localStorage.setItem( key , value );
                    else document.cookie = key + '=' + value;
                }
            },
            
            // Get a specific value from local storage :
            get: function ( key ) {
            
                // Replacement of the parameter key to prefix it with the project namespace :
                key = '$m.' + key;
                
                // Value initialization :
                var value = '';
                
                // read the value rom local storage :
                if ( window.localStorage ) {
                    value = window.localStorage.getItem( key );
                } else if ( document.cookie.match( new RegExp( '(?:^|;)'+key+'=' ) ) !== undefined ) {
                    var val = document.cookie.replace( new RegExp( '(?:^|.*;)'+key+'=([^;]*)(?:;.*|$)' ) , '$1' );
                    if ( val != document.cookie ) value = val;
                }
                
                return JSON.parse( value !== 'undefined' ? value : '' );
            },
            
            // Remove key from local storage :
            remove: function ( key ) {
                if ( window.localStorage ) {
                    window.localStorage.removeItem( key );
                } else if ( document.cookie.match( new RegExp( '(?:^|;)'+key+'=' ) ) !== undefined ) {
                    document.cookie = key + '=';
                }
            },
        }
    });   
})(jQuery);
