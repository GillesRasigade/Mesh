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
        utils: {
            notify: function ( data ) {
                if ( data === undefined ) return true;
                
                data.img = data.img !== undefined ? data.img : './images/favicon.png';
                data.title = data.title !== undefined ? data.title : 'Media Server';
            
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
            upload: function(files, path, index) {
                event.stopPropagation();
                event.preventDefault();

                var evt = event;
                if (index == undefined) {
                    index = 0;
                    files = files.dataTransfer.files;
                    console.log('Uploading... Please wait.');
                }

                var length = files.length;

                /* Lets build a FormData object*/
                var fd = new FormData();

                fd.append('directory', $m.state.path); // Append the directory path

                var totalSize = 0, totalDone = 0;
                for (i = 0; i < files.length; i++) {
                    totalSize += files[i].size;
                    totalDone += (i < index ? files[i].size : 0);
                }

                if (!files[index]) {
                    img++;
                    if (index < length)
                        $m.utils.upload(files, path, index);
                    return;
                }

                fd.append('files[]', files[index]);

                var xhr = new XMLHttpRequest(); // Create the XHR (Cross-Domain XHR FTW!!!) Thank you sooooo much imgur.com
                //xhr.open(\"POST\", \"https://".$_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"]."\"); // Boooom!
                //xhr.open(\"POST\", \"http".( $_SERVER["HTTPS"] ? "s" : "" )."://".$_SERVER["SERVER_NAME"].$_SERVER["REQUEST_URI"]."\"); // Boooom!
                xhr.open('POST', $m.api.utils.url('file', 'upload', {path: path}));
                xhr.onload = function() {
                    //needConfirmationBeforeExit--;

                    if (index < length) {
                        $m.utils.upload(files, path, index);
                    } else {
                        console.log(99 , 'Reloading...' , path );
                        
                        $m.explorer.refresh(path);
                        
                        //$('.upload-progress .bar').css('width','100%');

                        //if ( $('.upload-progress').closest('.album, .type-folder').length == 0 ) {
                        if ($('.upload-progress').closest('#top').length) {
                            $('#view-switcher .active').trigger('click');
                        }

                        $('.upload-progress').fadeOut(400, function() {
                            
                            console.log( 109 , path );
                            
                            //$('.column.folder[data-path="'+path+'"] > .content  > .type > .column').each(function(i,o){ $(o).empty(); });
                            
                            $(this).remove();
                            
                            
                        });

                    }

                    return;
                }

                var uploadXHR = xhr.upload;
                uploadXHR.addEventListener('progress', function(ev) {

                    if (ev.lengthComputable) {
                        var percentLoaded = Math.round(parseFloat((totalDone + ev.loaded) / totalSize) * 100);
                        //progressbar.style.width = percentLoaded+'%';
                        $('.upload-progress .bar').css('width', percentLoaded + '%')
                        //progressbarHeader.style.width = percentLoaded * document.getElementById('box_header').clientWidth / 100;
                        //document.getElementById('upload-text').textContent = (index-1)+'/'+files.length+' file'+(index>1?'s':'')+' uploaded ('+percentLoaded+' %)';
                    }
                }, false);


                //needConfirmationBeforeExit++;

                xhr.send(fd);

                index++; // Append the file
            },
            
            rename: function ( path ) {
                var filename = path.replace(/^.*\/([^\/]+$)/,'$1',path);
                var name = prompt('Rename in:',filename);
                if ( filename !== name ) {
                    console.log(path,filename,name);
                    $m.api.put({ c: 'file', a: 'rename', path: path, name: name },function(json){
                        if ( json.confirm && confirm('Another file exists with this name, overwrite it ?')) {
                            // Not yet implemented...
                            $m.api.put({ c: 'file', a: 'rename', path: path, name: name, force:true },function(json){
                                if ( json.success ) {} else {}
                            });
                        } else if ( json.success ) {
                            // 
                            var ps = path.replace(/^[^:]+:\/\//,'').replace(/[^\/]+$/,'');
                            var file = path.replace(/^.*\//,'');
                            $m.storage.fs.remove( ps , file );
                            
                            $('*[data-path="'+path+'"]').attr('title',name).find('.entry-name').text(name).attr('title',name);
                            $('#explorer-tree-nav a[data-path="'+path+'"]').text(name);
                            
                            $('*[data-path^="'+path+'"]').each(function(i,o){
                                var $o = $(o);
                                var p = $o.attr('data-path');
                                $o.attr('data-path',p.replace(path,path.replace(filename,name)));
                            });
                            
                        } else {
                        }
                    });
                }
            }
        }
    });   
})(jQuery);
