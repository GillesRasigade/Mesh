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
        admin: {
            panel: function() {
                 $m.api.get({c:'admin',a:'panel'},function( json ){
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
                $m.api.get({c:'admin',a:'test'},function( json ){
                    
                    for ( var i in json.lines ) {
                        for ( var t in json.lines[i] ) {
                            console[t](json.lines[i][t]);
                        }
                    }
                    
                });
            },
        },
    });   
})(jQuery);
