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
        app: {
            init: function() {
                
            },
        
        
            panel: function() {
                 $m.api.get({c:'app',a:'panel'},function( json ){
                    console.log( json );
                    
                    $('#server-configuration-panel').remove();
                    var $div = $('<div class="row-fluid"></div>');
                    
                    if ( json && json.config ) {
                        for ( var i in json.config ) {
                            if ( typeof(json.config[i]) == 'object' ) {
                                for ( var j in json.config[i] ) {
                                    //$div.append( '<label for="config-'+i+'-'+j+'">'+i+' - '+j+': <input type="text" id="config-'+i+'-'+j+'" value=\''+json.config[i][j]+'\'/></label>' );
                                    $div.append('<div class="control-group">'+
                                        '<label class="control-label" for="config-'+i+'">'+i+' - '+j+'</label>'+
                                        '<div class="controls">'+
                                            '<input style="height: auto;" type="text" id="config-'+i+'-'+j+'" placeholder="'+i+' '+j+'" value=\''+json.config[i][j]+'\'>'+
                                        '</div>'+
                                    '</div>');
                                }
                            } else {
                                //$div.append( '<label for="config-'+i+'">'+i+': <input type="text" id="config-'+i+'" value=\''+json.config[i]+'\'/></label>' );
                                $div.append('<div class="control-group">'+
                                    '<label class="control-label" for="config-'+i+'">'+i+'</label>'+
                                    '<div class="controls">'+
                                        '<input style="height: auto;" type="text" id="config-'+i+'" placeholder="'+i+'" value=\''+json.config[i]+'\'>'+
                                    '</div>'+
                                '</div>');
                            }
                        }
                    }
                    
                    var $config = $('<div id="server-configuration-panel" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="server-initialization" aria-hidden="true">'+
                        '<div class="modal-header">Configuration</div>'+
                        '<div class="modal-body">'+
                            '<form id="server-configuration-form" class="form-horizontal">'+
                            '</form>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                            '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                        '</div>'+
                    '</div>');
                    
                    $('#server-configuration-form',$config).append( $div );
                    $('body').append( $config );
                    
                    $('#server-configuration-panel').modal('show');
                    
                 });
            },
            test: function() {
                $m.api.get({c:'app',a:'test'},function( json ){
                    
                    for ( var i in json.lines ) {
                        for ( var t in json.lines[i] ) {
                            console[t](json.lines[i][t]);
                        }
                    }
                    
                });
            },
            
            update: function() {
                // Read Git/Github versions to offer update :
                $m.api.get({c:'github',a:'commits'},function( commits ){
                    $m.api.get({c:'github',a:'sha',api:'api.php'},function( j ){
                        var sha = j.sha;
                        var csha = $m.storage.get('state.sha');
                        var releases = '';
                        
                        
                        for ( var c = 0; c < commits.length; c++ ) {
                            if ( commits[c].sha == sha ) break;
                            if ( c > 10 ) { releases  += '...\n'; break; }
                            releases += '- '+ commits[c].commit.message+'\n';
                        }
                        console.log('commits: ',commits,'sha: '+sha,'csha: '+csha,'releases: '+releases);
                        
                        // Bind a cache update event:
                        window.applicationCache.onupdateready = function(e) {
                            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                                $m.storage.set('state.sha',sha);
                                // Browser downloaded a new app cache.
                                // Swap it in and reload the page to get the new hotness.
                                window.applicationCache.swapCache();
                                //if (confirm('New version available:\n'+releases+'\nLoad it?')) {
                                    window.location.reload();
                                //}
                            } else {
                                // Manifest didn't changed. Nothing new to server.
                            }
                        };
                        
                        // Current cached version is not synced with Github project:
                        if ( csha !== sha                                           // Local server/client unsynced
                            || ( commits.length && commits[0].sha !== sha )         // local server /github unsynced
                        ) {
                            
                            // Try to perform the auto-update process :
                            $m.api.get({c:'github',a:'pull'},function( json ){
                                $m.log( 'Server update status' , json );
                                
                                $m.storage.set('state.sha',sha);
                                $('.git-sha').text( sha ).attr('title',sha);
                                
                                // Reset all cache data then reload:
                                try {
                                    window.applicationCache.update(); // Attempt to update the user's cache.
                                } catch ( e ) {}
                            });
                        }
                    });
                });
            },

            reset: function() {

                if (confirm('Reset application data?')) {

                    // Remove the local storage data:
                    localStorage.clear();

                    // Remove the local file system data:
                    $m.storage.fs.clear(function(){

                        // Bind a cache update event:
                        window.applicationCache.onupdateready = function(e) {
                            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                                $m.storage.set('state.sha',sha);
                                // Browser downloaded a new app cache.
                                // Swap it in and reload the page to get the new hotness.
                                window.applicationCache.swapCache();
                                //if (confirm('New version available:\n'+releases+'\nLoad it?')) {
                                    window.location.reload();
                                //}
                            }

                            window.location.reload();

                        };

                        window.applicationCache.onchecking = function(e) {
                            window.location.reload();
                        }


                        try {
                            // Clear the application cache:
                            window.applicationCache.update();
                        } catch ( e ) {
                            window.location.reload();
                        }
                    });
                }

            }
        },
    });   
})(jQuery);
