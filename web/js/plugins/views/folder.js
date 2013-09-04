(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
            folder: {
                init: function () {
                    $('#menu-dropdown .dropdown-menu .divider.last').before( '<li><a href="javascript:$m.explorer.events.createFolder(event);"><i class=" icon-folder-open"></i> Create a folder</a></li>' )
                },
                columns: {
                    width: 320, number: 3
                },
                setColumns: function( $folder , $folders ) {
                
                    $folders.empty();
                
                    $m.view.folder.columns.width = $m.utils.getWidth();
                    
                    $m.view.folder.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.folder.columns.width / $m.state.scale ));
                    
                    //$m.view.folder.columns.width = $folder.parent().width() / $m.view.folder.columns.number * $m.state.scale;
                    
                    for ( var i = 0 ; i < $m.view.folder.columns.number ; i++ ) {
                        $folders.append('<div class="column" style="width: '+(100/$m.view.folder.columns.number)+'%;"><div class="column-content"></div></div>');
                    }
                    
                    return $folders;
                },
                initialize: function( path ) {
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.folders').remove();
                        
                        var partId = $folder.closest('.folder').attr('id')+'__folder';
                        var $folders = $('<div class="folders type" id="'+partId+'"></div>');
                        
                        $m.view.folder.setColumns($folder,$folders);
                        
                        $folder.prev().append('<a href="#'+partId+'" class="quick-folder" style="display: none;">Folders</a>');
                        
                        $folder.append( $folders );
                    }
                
                },
                
                resize: function ( $folders ) {
                    var $entries = $('.entry',$folders).clone();
                    
                    $m.view.folder.setColumns($folders.parent(),$folders);
                    
                    $entries.sort(function(a,b){
                        //return $(a).attr('data-path').toLowerCase() - $(b).attr('data-path').toLowerCase();
                        if($(a).attr('data-path') < $(b).attr('data-path')) return -1;
                        if($(a).attr('data-path') > $(b).attr('data-path')) return 1;
                        return 0;
                    });
                    
                    $entries.each(function(i,o){
                        // Photo positioning :
                        var h = -1; var column = Math.ceil(Math.random()*$m.view.folder.columns.number);
                        var $f = $folders.parent().parent();
                        for ( var c = 1 ; c <= $m.view.folder.columns.number ; c++ ) {
                            var $c = $folders.find('> .column:nth-child('+c+') > .column-content');


                            if ( !$f.hasClass('active') )
                                $f.css({'position':'absolute','visibility':'hidden', 'display':'block'});

                            var height = $c.height();

                            if ( !$f.hasClass('active') )
                                $f.css({'position':'','visibility':'', 'display':''});


                            if ( h == -1 || height < h ) {
                                h = height; column = c;
                            }
                        }
                        
                        $(o).find('.img-polaroid').css('height',($m.view.folder.columns.width*$m.state.scale/2)+'px');
                        
                        $folders.find(' > .column:nth-child('+column+') > .column-content').append($(o));
                    });
                },
                
                load: function ( path , json ) {
                
                    //console.log( 86 , json );
                
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.folders' ).length === 0 ) $m.view.folder.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                                
                                $folder.prev().find('.quick-folder').show();
                                
                                var p = ( path )+'/'+json[i];
                                
                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
//                                if ( json[i] ) {
                                
                                    // Photo positioning :
                                    var h = -1; var column = Math.ceil(Math.random()*$m.view.folder.columns.number);
                                    var $f = $folder.parent();
                                    for ( var c = 1 ; c <= $m.view.folder.columns.number ; c++ ) {
                                        var $c = $folder.find('.folders > .column:nth-child('+c+') > .column-content');


                                        if ( !$f.hasClass('active') )
                                            $f.css({'position':'absolute','visibility':'hidden', 'display':'block'});

                                        var height = $c.height();

                                        if ( !$f.hasClass('active') )
                                            $f.css({'position':'','visibility':'', 'display':''});


                                        if ( h == -1 || height < h ) {
                                            h = height; column = c;
                                        }
                                    }

                                    var title = json[i] ;
                                    var details = [];
                                    if ( title && title.match(/^[\d-,]+ /) ) {
                                        details.push( title.replace(/^([\d-,]+) .*/,'$1') );
                                        title = title.replace(/^[\d-,]+ /,'');
                                    }
                                    
                                    // Share toek building:
                                    var sharedToken = $m.api.utils.token({
                                        shared: true,
                                        url: $m.state.servers[ $m.state.server ].url,
                                        path: p,
                                        auth: $m.state.servers[ $m.state.server ].share
                                    });
                                    
                                    //console.log( 145 , $m.state.servers[ $m.state.server ].share , sharedToken , $m.api.utils.token( sharedToken ) );

                                    //title="'+json['folder'][i]+'"
                                    var $div = $('<a data-path="'+p+'" href="javascript:void(0)" class="album entry">'+
                                            '<i class="icon-spinner icon-spin icon-large" style="inline-block;"></i>'+
                                            '<span class="album-img img-polaroid" style="height: '+($m.view.folder.columns.width*9/16)+'px"></span>'+
                                            '<span class="actions">'+
                                                //'<a href="'+$m.state.servers[ $m.state.server ].url.replace(/api.php.*$/,'index.php')+'?link='+sharedToken+'" target="_blank" class="btn btn-link folder-share"><i class="icon-share"></i></a>'+
                                                //'<a class="icon-share">&nbsp;</a>'+
                                                '<div onClick="$m.view.folder.share(\''+p+'\',\''+$m.state.servers[ $m.state.server ].url.replace(/api.php.*$/,'index.php')+'?link='+sharedToken+'\');" class="btn btn-link folder-share"><i class="icon-share"></i></div>'+
                                                '<div title="Download album" class="btn btn-link folder-download" style="display: none;"><i class="icon-download"></i></div>'+
                                                '<i class="icon-remove delete-folder"></i>'+
                                            '</span>'+
                                            '<span title="'+json[i]+'" class="album-title">'+title.replace(/.*\//,'')+'</span>'+
                                            '<span class="album-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</a>');

                                    $folder.find('.folders > .column:nth-child('+column+') > .column-content').append($div);
                                    
                                    (function(p){
                                    
                                        var ps = p.replace(/^[^:]+:\/\//,'');
                                    
                                        $m.storage.fs.get(ps,'m.thumb.txt',function( content ){
                                            //console.log( content );
                                            if ( content !== '' ) {// Local File System cache management
                                                $div.find('.album-img').css('background-image','url(\''+content+'\')');
                                                
                                            } else if ( $m.state.thumbs[$m.state.server+'://'+ps] !== undefined ) {// Browser app memory
                                                $div.find('.album-img').css('background-image','url(\''+$m.state.thumbs[$m.state.server+'://'+ps]+'\')');
                                                $m.storage.fs.set(p,'m.thumb.txt',$m.state.thumbs[$m.state.server+'://'+ps]);
                                                
                                            } else {// Otherwise
                                                //$div.find('.album-img').css('background-image','url(\''+$m.view.image.src(p,'thumb',true)+'\')');
                                                
                                                $.ajax({
                                                    url:$m.view.image.src(ps,'thumb',true),
                                                    dataType: 'jsonp',
                                                    success:function(json){
                                                        $div.find('.album-img').css('background-image','url(\''+json.base64+'\')');
                                                        $m.state.thumbs[$m.state.server+'://'+ps] = json.base64;
                                                        $m.storage.fs.set(ps,'m.thumb.txt',json.base64);
                                                }});
                                                
                                            }
                                        });
                                    })(p);
                                }
                                
                                setTimeout(function(){ i++; f[0](); },25);
                            } else f[1]();
                        },
                        function() {
                        
                            setTimeout(function(){
                            
                                $('.album .album-title.details:not(.updated)').each(function(i,o){
                                    var $o = $(o).addClass('updated');
                                    var p = $o.closest('.album').attr('data-path');
                                    
                                    var display = function ( details ) {
                                        var $details = $o;
                                        for ( var t in details.counts ) {
                                            if ( details.counts[t] > 0 && !t.match(/(hidden)/)) {
                                                var icon = t;
                                                switch ( t ) {
                                                    case 'folder': icon = 'folder-open'; break;
                                                    case 'image': icon = 'picture'; break;
                                                    case 'video': icon = 'film'; break;
                                                    case 'card': icon = 'list-alt'; break;
                                                    case 'pdf': icon = 'book'; break;
                                                }
                                                $details.append( '<i class="icon-'+icon+'" title="'+details.counts[t]+' '+t+(details.counts[t]>1?'s':'')+'"> '+details.counts[t]+'</i> &nbsp;');
                                            }
                                        }
                                        
    //                                    $details.append('<i class="icon-info-sign" title="'+details.size+'"></i> &nbsp;')
                                        $details.append('<i class="icon-hdd" title="Total size: '+details.size+'"> '+details.size+'</i> &nbsp;')
                                        
                                        if ( details.size.match(/G$/) ) $o.closest('.album').find('.folder-download').remove();
                                        else $o.closest('.album').find('.folder-download').show();

                                        //if ( i < json['folder'].length-1 ) { i++; setTimeout(function(){ f[0](i); },50); }
                                        if ( $('.album .album-title.details:not(.updated)').length ) f[1]();   ;
                                    }
                                    
                                    var ps = p.replace(/^[^:]+:\/\//,'');
                                    $m.storage.fs.get(ps,'m.details.txt',function( content ){
                        
                                        if ( content !== '' ) {
                                            display( JSON.parse( content ) );
                                        } else {
                                    
                                            $m.api.get({c:'file',a:'details',path: ps},function(details){
                                            
                                                $m.storage.fs.set(ps,'m.details.txt',JSON.stringify( details ));

                                                display( details );
                                            });
                                        }
                                    });
                                });
                            
                            },50);
                        }
                    ]; f[0]();
                },
                
                
                share: function ( path , url ) {
                    if ( undefined === $m.shared ) {
                    
                        if ( !url.match(/^https?:\/\//) ) {
                            url = url.replace( /^.*\?/ , window.location.href.replace(/\?.*$/,'') + '?' );
                        }
                        
                        $m.explorer.helper.modal({
                            header: 'Share link for '+path.replace(/^.*\//,''),
                            body: '<textarea rows="3" style="width: 100%; overflow: hidden;">'+url+'</textarea><br/>'+
                                '<g:plus action="share" href="'+url+'"></g:plus>',
                            onshow: function( modal ) {
                                setTimeout(function(){
                                    gapi.plus.go( modal );
                                },150);
                            }
                        });
                        
                        
                    }
                
                    return false;
                }
            },
        }
    });
    
    
    $m.view.folder.init();
})(jQuery);
