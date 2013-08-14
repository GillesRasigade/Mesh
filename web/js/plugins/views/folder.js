(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
            folder: {
                init: function () {
                    $('#menu-dropdown .dropdown-menu .divider.last').before( '<li><a href="#card-creation" role="button" data-toggle="modal"><i class="icon-pencil"></i> Create a card</a></li>' )
                },
                columns: {
                    width: 320, number: 3
                },
                setColumns: function( $folder , $folders ) {
                
                    $folders.empty();
                
                    if ( $(window).width() < 480 ) $m.view.folder.columns.width = $(window).width()/2;
                    else $m.view.folder.columns.width = 320;
                    
                    $m.view.folder.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.folder.columns.width / $m.state.scale ));
                    
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
                        
                        $folders.find(' > .column:nth-child('+column+') > .column-content').append($(o));
                    });
                },
                
                load: function ( path , json ) {
                
                    
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

                                    //title="'+json['folder'][i]+'"
                                    var $div = $('<a data-path="'+p+'" href="javascript:void(0)" class="album entry">'+
                                            '<i class="icon-spinner icon-spin icon-large" style="inline-block;"></i>'+
                                            '<span class="album-img img-polaroid" style="background: url(\''+$m.view.image.src(p,'thumb')+'\');"></span>'+
                                            '<span class="actions">'+
                                                '<div title="Download album" class="btn btn-link folder-download" style="display: none;"><i class="icon-download"></i></div>'+
                                                '<i class="icon-remove delete-folder"></i>'+
                                            '</span>'+
                                            '<span title="'+json[i]+'" class="album-title">'+title.replace(/.*\//,'')+'</span>'+
                                            '<span class="album-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</a>');

                                    $folder.find('.folders > .column:nth-child('+column+') > .column-content').append($div);
                                    
                                    /*if ( $m.state.thumbs[p] !== undefined ) {
                                        $div.find('.album-img').css('background-image','url(\''+$m.state.thumbs[p]+'\')');
                                    } else {
                                        var image = new Image();
                                        image.onload = function () {
                                            
                                            $m.state.thumbs[p] = $m.view.image.utils.getImageUrl( image );
                                            $m.storage.set('state.thumbs',$m.state.thumbs);
                                            
                                            $div.find('.album-img').css('background-image','url(\''+$m.state.thumbs[p]+'\')');
                                        }

                                        image.src = $m.view.image.src(p,'thumb');
                                    }*/
                                }
                                
                                setTimeout(function(){ i++; f[0](); },25);
                            } else f[1]();
                        },
                        function() {
                        
                            setTimeout(function(){
                            
                                $('.album .album-title.details:not(.updated)').first().each(function(i,o){
                                    var $o = $(o).addClass('updated');
                                    var p = $o.closest('.album').attr('data-path');
                                    $m.api.get({c:'file',a:'details',path: p},function(details){

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
                                    });
                                });
                            
                            },250);
                        }
                    ]; f[0]();
                }
            },
        }
    });
    
    
    $m.view.folder.init();
})(jQuery);
