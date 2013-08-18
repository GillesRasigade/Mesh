(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            video: {
                
                config: {
                    vlc: false
                },
            
                src: function ( path , mode ) {
                    return $m.api.utils.url( mode == 'thumb' ? 'video' : 'file' , mode == 'thumb' ? 'access' : 'access' , {
                        path: path, mode: mode !== undefined ? mode : 'full'
                    });
                }, 
            
            
                columns: {
                    width: 320, number: 3,
                },
                
                setColumns: function( $folder , $folders ) {
                
                    $folders.empty();
                
                    if ( $(window).width() < 480 ) $m.view.video.columns.width = $(window).width()/2;
                    else $m.view.video.columns.width = 320;
                    
                    $m.view.video.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.video.columns.width / $m.state.scale ));
                    
                    for ( var i = 0 ; i < $m.view.video.columns.number ; i++ ) {
                        $folders.append('<div class="column" style="width: '+(100/$m.view.video.columns.number)+'%;"><div class="column-content"></div></div>');
                    }
                    
                    return $folders;
                },
                
                initialize: function( path ) {
            
                    if ( window.navigator !== undefined && navigator.mimeTypes !== undefined ) {
                        for ( var i in navigator.mimeTypes ) {
                            if ( navigator.mimeTypes[i] && navigator.mimeTypes[i].type && navigator.mimeTypes[i].type.match(/x-vlc-plugin/) ) {
                                $m.view.video.config.vlc = true;
                                break;
                            }
                        }
                    }
                
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.videos').remove();
                        
                        var partId = $folder.closest('.folder').attr('id')+'__video';
                        var $folders = $('<div class="videos type entries" id="'+partId+'"></div>');
                        
                        $m.view.video.setColumns($folder,$folders);
                        
                        $folder.prev().append('<a href="#'+partId+'" class="quick-video" style="display: none;">Videos</a>');
                        
                        $folder.append( $folders );
                    }
                
                },
                
                resize: function ( $folders ) {
                    var $entries = $('.entry',$folders).clone();
                    
                    $m.view.video.setColumns($folders.parent(),$folders);
                    
                    $entries.sort(function(a,b){
                        //return $(a).attr('data-path').toLowerCase() - $(b).attr('data-path').toLowerCase();
                        if($(a).attr('data-path') < $(b).attr('data-path')) return -1;
                        if($(a).attr('data-path') > $(b).attr('data-path')) return 1;
                        return 0;
                    });
                    
                    $entries.each(function(i,o){
                        // Photo positioning :
                        var c = i%$m.view.video.columns.number+1;
                        var h = -1; var column = c !== undefined ? c : 1;
                        var $f = $folders.parent().parent();
                        for ( var c = 1 ; c <= $m.view.video.columns.number ; c++ ) {
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
                    
                    if ( $folder.find( '.videos' ).length === 0 ) $m.view.video.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                                
                                $folder.prev().find('.quick-video').show();
                        
                                var p = path+'/'+json[i];
                                
                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
//                                if ( json[i] ) {
                                
                                    // Photo positioning :
                                    var h = -1; var column = Math.ceil(Math.random()*$m.view.video.columns.number);
                                    var $f = $folder.parent();
                                    for ( var c = 1 ; c <= $m.view.video.columns.number ; c++ ) {
                                        var $c = $folder.find('.videos > .column:nth-child('+c+') > .column-content');


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
                                    if ( title ) {
                                        if ( title.match(/^[\d-,]+ /) ) {
                                            details.push( title.replace(/^([\d-,]+) .*/,'$1') );
                                        }


                                        details.push( title.replace(/.*\.([^\.]+)$/,'$1') );

                                        title = title.replace(/^[\d-,]+ /,'').replace(/\.[^\.]+$/,'');
                                    }

                                    //title="'+json['folder'][i]+'"
                                    var $div = $('<div data-path="'+p+'" class="video entry">'+
                                            '<img class="video-img" src="'+$m.view.video.src(p,'thumb')+'" style="height: auto; padding: 0px; margin: 0px; border: 0px;"/>'+
                                            '<i class="video-over icon-play-sign"></i>'+
                                            '<span class="actions">'+
                                                //'<a target="_blank" href="'+$m.view.video.src(p)+'" class="icon-facetime-video" style="color: black;"></a>'+
                                                '<div class="btn btn-link video-play"><i class="icon-facetime-video"></i></div>'+
                                                '<div class="btn btn-link file-download"><i class="icon-download"></i></div>'+
                                            '</span>'+
                                            '<span title="'+json[i]+'" class="video-title">'+title+'</span>'+
                                            '<span class="video-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</div>');

                                    $folder.find('.videos > .column:nth-child('+column+') > .column-content').append($div);
                                }
                                
                                setTimeout(function(){ i++; f[0](); },25);
                            } else f[1]();
                        },
                        function() {
                            
                            setTimeout(function(){
                            
                                $('.video .video-title.details:not(.updated)').each(function(i,o){
                                    var $o = $(o).addClass('updated');
                                    var p = $o.closest('.entry').attr('data-path');
                                    
                                    var display = function ( details ) {
                                        var $details = $o.empty();
                                        for ( var input in details ) {
                                            $details.append( details[input]['duration'] );
                                            $details.append( '&nbsp;-&nbsp;' + details[input]['bitrate']);
                                            break;
                                        }
                                        
                                        if ( $('.video .video-title.details:not(.updated)').length ) f[1]();   ;
                                    }
                                    
                                    var filename = p.replace(/^.*\//,'');
                                    var folder = p.replace(/\/[^\/]+$/,'');
                                    
                                    console.log( 'Updating video details: ' , filename );
                                    
                                    var ps = folder.replace(/^[^:]+:\/\//,'');
                                    console.log( folder, ps );
                                    $m.storage.fs.get(ps,'m.details.'+filename+'.txt',function( content ){
                        
                                        if ( content !== '' ) {
                                            display( JSON.parse( content ) );
                                        } else {
                                    
                                            $m.api.get({c:'video',a:'details',path: p},function(details){
                                            
                                                console.log( filename , details );
                                            
                                                $m.storage.fs.set(ps,'m.details.'+filename+'.txt',JSON.stringify( details ));

                                                display( details );
                                            });
                                        }
                                    });
                                });
                            
                            },50);
                        }
                    ]; f[0]();
                },
                
                show: function ( $entry ) {
                    var $splash = $('#splash-screen');
                    var path = $entry.attr('data-path');
                    var src = $m.view.image.src(path,'preview');
                    
                    if ( !$splash.is(':visible') ) $splash.fadeIn();
                    
                    var $player = $entry.find('.video-player');
                    
                    var f = [
                        function ( url ) {
                            if ( $m.view.video.config.vlc ) {

                                setTimeout(function(){
                                    //$entry.find('.video-img').hide();
                                    $('.content',$splash).empty().show()
                                        .append('<object class="video-player entry-show" type="application/x-vlc-plugin" data-path="'+path+'" data="'+url+'" width="100%" height="100%">'+
                                            '<param name="movie" value="'+url+'"/>'+
                                            '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" name="video1" '+
                                            'autoplay="no" loop="no" width="100%"'+
                                            'target="'+url+'" />'+
                                            '<a href="'+url.replace(/^http:/,'vlc:')+'">Open in VLC</a>'+
                                        '</object>');
                                    },1000);

                            } else {
                                window.location = url.replace(/^http:/,'vlc:');
                            }
                        },
                        function( scale ){
                            scale = undefined !== scale ? scale : 1;
                            $m.api.get({ c:'video', a:'stream', scale:scale, path: path, 'max-width': window.screen.width, 'max-height': window.screen.height },function(json){

                                if ( json && json.url ) {
                                    $entry.attr('data-src',json.url);

                                    f[0](json.url);
                                    
                                    $entry.find('.video-play i').toggleClass('icon-facetime-video').toggleClass('icon-stop');
                                    
                                }

                            });
                        }
                    ];
                    
                    if ( $entry.length && $('.icon-stop',$entry).length == 0 ) {
                    
                        var filename = path.replace(/^.*\//,'');
                        var folder = path.replace(/\/[^\/]+$/,'');
                    
                        $m.storage.fs.get(folder,'m.details.'+filename+'.txt',function( content ){
                        
                            var scale = 1;
                            if ( content !== '' ) {
                                var details = JSON.parse(content);
                                for ( var i in details ) {
                                    for ( var s in details[i].streams ) {
                                        if ( details[i].streams[s].type.match(/video/i) ) {
                                            if ( details[i].streams[s].info.match( /\d+x\d+/ ) ) {
                                                var size = details[i].streams[s].info.replace( /.*\s(\d+x\d+).*/ , '$1' ).split('x');
                                                //scale = Math.min( 1 , Math.min( window.screen.width / parseInt(size[0],10) , window.screen.height / parseInt(size[1],10) ));
                                                
                                                scale = Math.min( 1 , Math.min( Math.max( window.screen.height , window.screen.width ) / Math.max( parseInt(size[0],10) , parseInt(size[1],10))));
                                                
                                                console.log( size , window.screen , scale );
                                            }
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                            console.log( scale );
                            
                            f[1](scale);
                        });
                    
                        
                        
                    } else f($entry.attr('data-src'));
                },
                        
                stop: function ( $entry ) {
                    var $player = $('.video-player');
                    
                    $m.api.get({ c:'video', a:'stop', stream: $entry.attr('data-src') },function(json){
                        $entry.attr('data-src','');
                        $player.remove();
                        $entry.find('.video-play i').toggleClass('icon-facetime-video').toggleClass('icon-stop');
                    });
                },
                
                // Stream video file with VLC and display result :
                __play: function ( path ) {
                    
                    var $entry = $('.folder.active .video.entry[data-path="'+path+'"]');
                    var $player = $entry.find('.video-player');
                    
                    if ( $entry.length && $('.icon-stop',$entry).length == 0 ) {
                    
                        $m.api.get({ c:'video', a:'stream', scale:0.5, path: path },function(json){

                            if ( json && json.url ) {
                                $entry.attr('data-src',json.url);

                                if ( $m.view.video.config.vlc ) {

                                    $entry.find('.video-img').hide();
                                    $entry.prepend('<object class="video-player" type="application/x-vlc-plugin" data="'+json.url+'" width="100%">'+
                                        '<param name="movie" value="'+json.url+'"/>'+
                                        '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" name="video1" '+
                                        'autoplay="no" loop="no" width="100%"'+
                                        'target="'+json.url+'" />'+
                                        '<a href="'+json.url.replace(/^http:/,'vlc:')+'">Open in VLC</a>'+
                                   '</object>');
                                   
                                } else {
                                    //window.open(json.url.replace(/^http:/,'vlc:'), '_blank');
                                    window.location = json.url.replace(/^http:/,'vlc:');
//                                    var $a = $('<a target="_blank" src="'+json.url.replace(/^http:/,'vlc:')+'"/>');
//                                    $('body').append($a);
//                                    setTimeout(function(){ $a.click().remove(); },150);
                                }
                                
                                $entry.find('.video-play i').toggleClass('icon-facetime-video').toggleClass('icon-stop');
                                
                            }

                        });
                        
                    } else {
                        $m.api.get({ c:'video', a:'stop', stream: $entry.attr('data-src') },function(json){
                            $entry.attr('data-src','');
                            $player.remove();
                            $entry.find('.video-img').show();
                            $entry.find('.video-play i').toggleClass('icon-facetime-video').toggleClass('icon-stop');
                        });
                    }
                    
                }
            },
        }
    } );
})(jQuery);
