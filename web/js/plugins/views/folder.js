(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
            folder: {
                init: function () {
                    $('#menu-dropdown .dropdown-menu .divider.last').before( '<li><a href="#card-creation" role="button" data-toggle="modal"><i class="icon-pencil"></i> Create a card</a></li>' )
                },
                columns: {
                    width: 320, number: 3,
                },
                initialize: function( path ) {
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.folders').remove();
                            
                        var $folders = $('<div class="folders type"></div>');
                        
                        $m.view.folder.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.folder.columns.width ));
                    
                        for ( var i = 0 ; i < $m.view.folder.columns.number ; i++ ) {
                            $folders.append('<div class="column" style="width: '+(100/$m.view.folder.columns.number)+'%;"><div class="column-content"></div></div>');
                        }
                        
                        $folder.append( $folders );
                    }
                
                },
                
                load: function ( path , json ) {
                
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.folders' ).length === 0 ) $m.view.folder.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                                
                                var p = ( path )+'/'+json[i];
                                
//                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
                                if ( json[i] ) {
                                
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
                                            '<span class="album-img img-polaroid" style="background-image: url(\''+$m.view.image.src(p,'thumb')+'\')"></span>'+
                                            '<span class="actions">'+
                                                '<i class="icon-remove delete-folder"></i>'+
                                            '</span>'+
                                            '<span title="'+json[i]+'" class="album-title">'+title+'</span>'+
                                            '<span class="album-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</a>');

                                    $folder.find('.folders > .column:nth-child('+column+') > .column-content').append($div);
                                }
                                
                                i++; f[0]();
                            } else f[1]();
                        },
                        function() {
                            
                            $('.album .album-title.details:not(.updated)').first().each(function(i,o){
                                var $o = $(o).addClass('updated');
                                var p = $o.closest('.album').attr('data-path');
                                console.log(p);
                                $m.api.get({c:'file',a:'details',path: p},function(details){

                                    var $details = $o;
                                    for ( var t in details ) {
                                        if ( details[t] > 0 ) {
                                            var icon = t;
                                            switch ( t ) {
                                                case 'folder': icon = 'folder-open'; break;
                                                case 'image': icon = 'picture'; break;
                                                case 'video': icon = 'film'; break;
                                                case 'card': icon = 'list-alt'; break;
                                            }
                                            $details.append( '<i class="icon-'+icon+'"></i> '+details[t]+' &nbsp;');
                                        }
                                    }

                                    //if ( i < json['folder'].length-1 ) { i++; setTimeout(function(){ f[0](i); },50); }
                                    if ( $('.album .album-title.details:not(.updated)').length ) f[1]();   ;
                                });
                            });
                        }
                    ]; f[0]();
                }
            },
        }
    });
    
    
    $m.view.folder.init();
})(jQuery);
