(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            image: {
            
                src: function ( path , mode ) {
                    return $m.api.utils.url('image','access',{
                        path: path, mode: mode !== undefined ? mode : 'full'
                    });
                },
            
            
                columns: {
                    width: 320, number: 3,
                },
                initialize: function( path ) {
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.images').remove();
                            
                        var $folders = $('<div class="images type"></div>');
                        
                        $m.view.image.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.image.columns.width ));
                    
                        for ( var i = 0 ; i < $m.view.image.columns.number ; i++ ) {
                            $folders.append('<div class="column" style="width: '+(100/$m.view.image.columns.number)+'%;"><div class="column-content"></div></div>');
                        }
                        
                        $folder.append( $folders );
                    }
                
                },
                
                load: function ( path , json ) {
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.images' ).length === 0 ) $m.view.image.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                            
                            if ( i < json.length ) {
                        
                                var p = path + '/' + json[i];
                                var c = i%$m.view.image.columns.number+1
                                //(function(path,c){
                                
//                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
                                if ( json[i] ) {
                                    
                                    var image = new Image();
                                    var $div = $('<div class="image entry" data-path="'+p+'" title="'+p.replace(/.*\//,'')+'" data-toggle="tooltip"></div>');
                                    
                                    var $img = $('<img draggable="true" data-preview="'+$m.view.image.src(p,'preview')+'" src="'+$m.view.image.src(p,'thumb')+'" style="width: 100%; display: none;"/>');
                                    
                                    image.onload = function () {
                                        //if ( initialize !== true ) return true;
                                        // Photo positioning :
                                        var h = -1; var column = c !== undefined ? c : 1;
                                        var $f = $folder.parent();
                                        for ( var c = 1 ; c <= $m.view.image.columns.number ; c++ ) {
                                            var $c = $folder.find('.images > .column:nth-child('+c+') > .column-content');
                                            
                                            if ( !$f.hasClass('active') )
                                                $f.css({'position':'absolute','visibility':'hidden', 'display':'block'});
                                            
                                            var height = $c.height();

                                            if ( !$f.hasClass('active') )
                                                $f.css({'position':'','visibility':'', 'display':''});
                                            
                                            
                                            if ( h == -1 || height < h ) {
                                                h = height; column = c;
                                            }
                                        }
                                        
                                        $folder.find('.images > .column:nth-child('+column+') > .column-content').append(
                                            $div.append( $img )
                                                .append( '<div class="actions">'+
                                                    '<div class="btn btn-link image-rotate" data-value="-90"><i class="icon-rotate-left"></i></div>'+
                                                    '<div class="btn btn-link image-rotate" data-value="90"><i class="icon-rotate-right"></i></div>'+
                                                    
                                                    '<div class="btn btn-link file-download"><i class="icon-download"></i></div>'+
                                                    
                                                    '<div class="btn btn-link image-cover"><i class="icon-picture"></i></div>'+
                                                    
                                                    '<div class="btn btn-link delete-folder"><i class="icon-remove"></i></div>'+
                                                    '</div>') );
                                                                        
                                        $img.fadeIn();
                                        i++; f[0]();
                                    }
                                    
                                    image.src = $m.view.image.src(p,'thumb');
                                } else {
                                    i++; f[0]();
                                }
                                    
                                //})(p,i%$m.view.image.columns.number+1);
                                
                            }
                            
                        }
                    ]; f[0]();
                },
                
                
                
                cover: function ( path ) {
                    var target = path;
                    if ( target.match( /\/[^\/]+\..+$/ ) ) target = target.replace(/\/[^\/]*$/,'');
                    if ( response = prompt( 'Which folder would you like to update ?' , target ) ) {
                    
                        if ( path.match( new RegExp( response )) ) {
                            var end = path.replace( response , '' );
                            var level = end.replace( /[^\/]/g , '' ).length - 1;
                        
                            $m.api.put({ c: 'image', a: 'cover', path: path, level: level, mode: 'thumb' },function(json){
                                if ( json.status == 'success' ) {
                                    var album = target.replace( new RegExp( '(\/[^\/]+){'+level+'}$' , 'g' ) , '' );
                                    $('.album[data-path="'+album+'"] .album-img').css( 'background-image' , 'url("'+$m.view.image.src(album,'thumb')+'&t='+(new Date().getTime())+'")' )
                                }
                            });
                        } else {
                            console.error('Only parent folders\' covers can be updated.')
                        }
                    }
                }
            },
        }
    } );
})(jQuery);
