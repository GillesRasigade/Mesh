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
        admin: {
            panel: function() {
                 $m.api.get({c:'admin',a:'panel'},function( json ){
                    console.log( json );
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
