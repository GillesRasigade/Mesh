(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            image: {
            
                src: function ( path , mode , base64 ) {
                    return $m.api.utils.url('image','access',{
                        path: path, mode: mode !== undefined ? mode : 'full',
                        base64: base64 !== undefined ? base64 : false,
                        shared: true
                    });
                },
                
                utils: {
                    // REF: http://robnyman.github.io/html5demos/localstorage/
                    getImageUrl: function ( image ) {
                        // Make sure canvas is as big as the picture
                        $m.view.image.utils.canvas.width = image.width;
                        $m.view.image.utils.canvas.height = image.height;

                        // Draw image into canvas element
                        $m.view.image.utils.context.drawImage(image, 0, 0, image.width, image.height);

                        // Save image as a data URL
                        return $m.view.image.utils.canvas.toDataURL("image/jpeg",100);
                    },
                },
            
            
                columns: {
                    width: 320, number: 3,
                },
                setColumns: function( $folder , $folders ) {
                
                    $folders.empty();
                
                    $m.view.image.columns.width = $m.utils.getWidth();
                    
                    $m.view.image.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.image.columns.width / $m.state.scale ));
                    
                    for ( var i = 0 ; i < $m.view.image.columns.number ; i++ ) {
                        $folders.append('<div class="column" style="width: '+(100/$m.view.image.columns.number)+'%;"><div class="column-content"></div></div>');
                    }
                    
                    return $folders;
                },
                
                initialize: function( path ) {
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.images').remove();
                        
                        var partId = $folder.closest('.folder').attr('id')+'__image';
                        var $folders = $('<div class="images type" id="'+partId+'"></div>').hide();
                        
                        $m.view.image.setColumns($folder,$folders);
                        
                        $folder.prev().append('<a href="#'+partId+'" class="quick-image" style="display: none;">Images</a>');
                        
                        $folder.append( $folders );
                        
                        
                    }
                
                },
                
                resize: function ( $folders ) {
                    var $entries = $('.entry',$folders).clone();
                    
                    $m.view.image.setColumns($folders.parent(),$folders);
                    
                    $entries.sort(function(a,b){
                        //return $(a).attr('data-path').toLowerCase() - $(b).attr('data-path').toLowerCase();
                        if($(a).attr('data-path') < $(b).attr('data-path')) return -1;
                        if($(a).attr('data-path') > $(b).attr('data-path')) return 1;
                        return 0;
                    });
                    
                    $entries.each(function(i,o){
                        // Photo positioning :
                        var c = i%$m.view.image.columns.number+1;
                        var h = -1; var column = c !== undefined ? c : 1;
                        var $f = $folders.parent().parent();
                        for ( var c = 1 ; c <= $m.view.image.columns.number ; c++ ) {
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
                    
                    if ( $folder.find( '.images' ).length === 0 ) $m.view.image.initialize( path );
                    
                    
                    $folder.find( '.images' ).show();
                    
                    var i = 0;
                    var f = [
                        function () {
                            
                            if ( i < json.length ) {
                                
                                $folder.prev().find('.quick-image').show();
                        
                                var p = path + '/' + json[i];
                                var c = i%$m.view.image.columns.number+1
                                //(function(path,c){
                                
//                                console.log( i , c , p );
                                
                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
//                                if ( json[i] ) {
                                    
                                    (function(p,c){
                                        var image = new Image();
                                        var $div = $('<div class="image entry" data-path="'+p+'" title="'+p.replace(/.*\//,'')+'" data-toggle="tooltip"></div>');

                                        var $img = $('<img draggable="true" data-preview="'+$m.view.image.src(p,'preview')+'" src="'+$m.view.image.src(p,'thumb')+'" style="width: 100%; display: none;"/>');

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
                                        
                                        
                                        var sharedLink = $m.api.utils.url('image','access',{
                                            path: p, mode: 'preview', base64: false, shared: true
                                        },$m.state.servers[ $m.state.server ].url );
                                        
                                        console.log( $m.state.servers[ $m.state.server ].url );

                                        $folder.find('.images > .column:nth-child('+column+') > .column-content').append(
                                            $div.append( $img )
                                                .append('<div class="actions">'+
                                                            '<div class="btn-group dropup">'+
                                                                '<button class="btn btn-mini btn-link dropdown-toggle" data-toggle="dropdown" style="padding: 0.5em 1em;">...</button>'+
                                                                '<ul class="dropdown-menu pull-right"></ul>'+
                                                            '</div>'+
                                                        '</div>') );
                                                /*.append( '<div class="actions">'+
                                                
                                                    '<div onClick="$m.view.folder.share(\''+p+'\',\''+sharedLink+'\');" class="btn btn-link image-share"><i class="icon-share"></i></div>'+
                                                
                                                    '<div class="btn btn-link image-rotate" data-value="-90"><i class="icon-rotate-left"></i></div>'+
                                                    '<div class="btn btn-link image-rotate" data-value="90"><i class="icon-rotate-right"></i></div>'+

                                                    '<div class="btn btn-link file-download"><i class="icon-download"></i></div>'+

                                                    '<div class="btn btn-link image-cover"><i class="icon-picture"></i></div>'+
                                                    '<div class="btn btn-link entry-rename"><i class="icon-edit"></i></div>'+

                                                    '<div class="btn btn-link delete-folder"><i class="icon-remove"></i></div>'+
                                                    '</div>') );*/
                                                $div.find('.dropdown-menu')
                                                    .prepend( $m.shared ? '' : '<li><a href="#" onClick="$m.view.folder.share(\''+p+'\',\''+sharedLink+'\');" class="image-share"><i class="icon-share"></i> Share</a></li>' )
                                                    .prepend( '<li><a href="#" class="file-download"><i class="icon-download"></i> Download</a></li>' )
                                                    .prepend( !$m.state.permissions.put ? '' : '<li><a href="#" class="image-cover"><i class="icon-picture"></i> Set as album cover</a></li>' )
                                                    
                                                    .prepend( !$m.state.permissions.put ? '' : '<li><a href="#" class="image-rotate" data-value="-90"><i class="icon-rotate-left"></i> Rotate left</a></li>' )
                                                    .prepend( !$m.state.permissions.put ? '' : '<li><a href="#" class="image-rotate" data-value="90"><i class="icon-rotate-right"></i> Rotate right</a></li>' )
                                                    
                                                    .prepend( !$m.state.permissions.put ? '' : '<li><a href="#" class="entry-rename"><i class="icon-edit"></i> Rename</a></li>' )
                                                    .prepend( !$m.state.permissions.delete ? '' : '<li><a href="#" class="delete-folder"><i class="icon-remove"></i> Remove</a></li>' )

                                        image.onload = function () {

                                            //$img.fadeIn(200);
                                            $img.show();
                                            setTimeout(function(){ i++; f[0](); },25);
                                        }
                                        
                                        setTimeout(function(){
                                            image.src = $m.view.image.src(p,'thumb');
                                        },25);

                                        
                                    })(p,c);
                                } else {
                                    i++; f[0]();
                                }
                                    
                                //})(p,i%$m.view.image.columns.number+1);
                                
                            }
                            
                        }
                    ]; f[0]();
                },
                
                show: function ( $entry ) {
                    var $splash = $('#splash-screen');
                    var path = $entry.attr('data-path');
                    var src = $m.view.image.src(path,'preview');
                    
                    //$splash.fadeOut();
                    if ( !$splash.is(':visible') ) $splash.fadeIn();
                    
                    var image = new Image();
                    image.onload = function () {
                        $('.content',$splash).empty().show()
                            .append('<img src="'+src+'" class="entry-show" data-path="'+path+'"/>').hide().fadeIn();
                    }
                    image.src = src;
                },
                
                
                
                cover: function ( path ) {
                    console.log( 'Cover.....' );
                
                    var target = path;
                    if ( target.match( /\/[^\/]+\..+$/ ) ) target = target.replace(/\/[^\/]*$/,'');
                    response = prompt( 'Which folder would you like to update ?' , target )
                    
                    //console.log('\n\n',response);
                
                    if ( path.match( new RegExp( response )) ) {
                        var end = path.replace( response , '' );
                        var level = end.replace( /[^\/]/g , '' ).length - 1;
                        
                        //console.log('\n\n',level,end,path);
                    
                        $m.api.put({ c: 'image', a: 'cover', path: path, level: level, mode: 'thumb' },function(json){
                            if ( json.status == 'success' ) {
                                var album = target.replace( new RegExp( '(\/[^\/]+){'+level+'}$' , 'g' ) , '' );
                                $m.storage.fs.remove( album , 'm.thumb.txt' );
                                $('.album[data-path="'+album+'"] .album-img').css( 'background-image' , 'url("'+$m.view.image.src(album,'thumb')+'&t='+(new Date().getTime())+'")' )
                            }
                        });
                    } else {
                        console.error('Only parent folders\' covers can be updated.')
                    }
                }
            },
        }
    } );
    
    // Initialize the Canvas for saving new thumbnails in localStorage:
    // REF: http://robnyman.github.io/html5demos/localstorage/
    $m.view.image.utils.canvas = document.createElement("canvas");
    $m.view.image.utils.context = $m.view.image.utils.canvas.getContext("2d");
    
})(jQuery);
