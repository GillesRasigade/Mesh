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
        storage: {
        
            // Definition of the local sandboxed File System (fs) methods:
            fs: {
                // REF: http://www.html5rocks.com/en/tutorials/file/filesystem/?redirect_from_locale=fr
                init: function () {
                    // Note: The file system has been prefixed as of Google Chrome 12:
                    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
                    
                    if ( window.requestFileSystem ) {
                        if ( window.webkitStorageInfo ) {
                            window.webkitStorageInfo.requestQuota(PERSISTENT, 100*1024*1024, function(grantedBytes) {
                                window.requestFileSystem(window.PERSISTENT, grantedBytes, $m.storage.fs.requestSuccess, $m.storage.fs.errorHandler);
                            }, function(e) {
                                console.log('Error', e);
                            });
                        } else {
                            window.requestFileSystem(window.TEMPORARY, 100*1024*1024 /*100MB*/, $m.storage.fs.requestSuccess, $m.storage.fs.errorHandler);
                        }
                    }
                },
                requestSuccess: function( fs ) {
                    console.log('Opened file system: ' + fs.name);
                    $m.storage.fs.instance = fs;
                },
                errorHandler: function( e ){
                    var msg = '';

                    switch (e.code) {
                        case FileError.QUOTA_EXCEEDED_ERR:
                            msg = 'QUOTA_EXCEEDED_ERR';
                            break;
                        case FileError.NOT_FOUND_ERR:
                            msg = 'NOT_FOUND_ERR';
                            break;
                        case FileError.SECURITY_ERR:
                            msg = 'SECURITY_ERR';
                            break;
                        case FileError.INVALID_MODIFICATION_ERR:
                            msg = 'INVALID_MODIFICATION_ERR';
                            break;
                        case FileError.INVALID_STATE_ERR:
                            msg = 'INVALID_STATE_ERR';
                            break;
                        default:
                            msg = 'Unknown Error';
                            break;
                    };

                    console.log('Error: ' + msg);
                },
                set: function ( path , filename , content , callback , params ) {
                
                    if ( undefined !== $m.storage.fs.instance ) {
                
                        // Recursively create the hierarchical structure:
                        $m.storage.fs.cmd.cd( $m.state.server + path , function( dir ){
                            //console.log( dir );
                            
                            setTimeout(function(){
                                dir.getFile( filename, {create: true}, function(fileEntry) {
                                    
                                    // Create a FileWriter object for our FileEntry (log.txt).
                                    fileEntry.createWriter(function(fileWriter) {

                                        fileWriter.onwriteend = callback;
                                        fileWriter.onerror = params ? params.error : $m.storage.fs.errorHandler;

                                        // Create a new Blob and write it to log.txt.
                                        var blob = new Blob([content], {type: params && params.type ? params.type : 'text/plain'});

                                        fileWriter.write(blob);

                                    }, $m.storage.fs.errorHandler);
                                });
                            },500);
                            
                        });
                    }
                },
                get: function ( path , filename , callback ) {
                
                    if ( undefined !== $m.storage.fs.instance ) {
                    
                        // Recursively create the hierarchical structure:
                        $m.storage.fs.cmd.cd( $m.state.server + path , function( dir ){
                            //console.log( dir );
                            
                            setTimeout(function(){
                                dir.getFile( filename, {create: true}, function(fileEntry) {
                                    
                                    fileEntry.file(function(file) {
                                        var reader = new FileReader();

                                        reader.onloadend = function(e) {
                                            if ( typeof(callback) == 'function' ) callback( this.result , fileEntry );
                                        };

                                        reader.readAsText(file);
                                    }, $m.storage.fs.errorHandler);
                                });
                            },25);
                        });
                    } else if ( typeof(callback) == 'function' ) callback('');
                },
                remove: function ( path , filename , callback ) {
                
                    if ( undefined !== $m.storage.fs.instance ) {
                    
                        // Recursively create the hierarchical structure:
                        $m.storage.fs.cmd.cd( $m.state.server + path , function( dir ){
                            //console.log( dir );
                            
                            setTimeout(function(){
                                if ( filename ) {
                                    
                                    dir.remove(function() {
                                        if ( typeof(callback) == 'function' ) callback();
                                    }, $m.storage.fs.errorHandler);
                                
                                } else {
                            
                                    dir.getFile( filename, {create: true}, function(fileEntry) {
                                        
                                        fileEntry.remove(function() {
                                            if ( typeof(callback) == 'function' ) callback();
                                        }, $m.storage.fs.errorHandler);
                                    });
                                    
                                }
                            },25);
                        });
                    } else if ( typeof(callback) == 'function' ) callback();
                    
                },
                cmd: {
                    // REF: http://www.html5rocks.com/en/tutorials/file/filesystem/?redirect_from_locale=fr#toc-dir-subirs
                    mkdir: function ( folders , callback , rootDirEntry ) {
                        rootDirEntry = rootDirEntry !== undefined ? rootDirEntry : $m.storage.fs.instance.root;
                        if ( typeof(folders) == 'string' ) folders = folders.split('/');
                    
                        // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
                        if (folders[0] == '.' || folders[0] == '') {
                            folders = folders.slice(1);
                        }
                        rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
                            // Recursively add the new subfolder (if we still have another to create).
                            if (folders.length) {
                                $m.storage.fs.cmd.mkdir(folders.slice(1),callback,dirEntry);
                            } else {
                                if ( typeof(callback) == 'function' ) callback( dirEntry );
                            }
                        }, $m.storage.fs.errorHandler);
                    },
                    pwd: function ( path ) {
                        
                    },
                    ls: function ( path ) {
                        
                    },
                    cd: function ( path , callback , rootDirEntry ) {
                        $m.storage.fs.cmd.mkdir( path , callback , rootDirEntry );
                    }
                }
            },
        
            // Set a parameter as a JSON value in the localStorage or as a cookie if not supported :
            set: function ( key , value ) {
                
                if ( value !== undefined ) {
            
                    // Update the media configuration or state value :
                    ns = key.split('.');
                    if ( ns.length > 1 ) $m[ns[0]][ns[1]] = value;

                    // Replacement of the parameter key to prefix it with the project namespace :
                    key = '$m.' + key;

                    // JSON value stringify :
                    value = JSON.stringify( value );

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
                
                // Android WebView JSON.parse does not correctly evaluate '' or 'null' or 'undefined' :
                try {
                    return JSON.parse( value !== 'undefined' ? value : '' );
                } catch ( e ) {
                    return 
                        value.match( /^\{.*\}$/ ) ? JSON.parse( value ) : 
                            ( value.match( /^[0-9\.]+$/ ) ? eval( value ) :
                                ( value != '' && value != 'undefined' && value != 'null' ? value : null )
                            );
                }
            },
            
            // Remove key from local storage :
            remove: function ( key ) {
                if ( window.localStorage ) {
                    window.localStorage.removeItem( key );
                } else if ( document.cookie.match( new RegExp( '(?:^|;)'+key+'=' ) ) !== undefined ) {
                    document.cookie = key + '=';
                }
            }
        }
    });
    
    // File System storage initialization:
    $m.storage.fs.init();
    
})(jQuery);
