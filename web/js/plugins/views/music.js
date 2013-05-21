(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            music: {
                data: {
                    track : { title:'#', class: 'tablet' },
                    title : { title:'Title', class: 'phone' },
                    duration: { title:'Duration', class: 'phone' },
                    album : { title:'Album', class: 'tablet' },
                    artist: { title:'Artist', class: 'tablet' },
                    
                    //'year'  : 'Year',
                    //'genre': 'Genre',
                    actions: { title:'', class: 'phone' },
                },
                init: function () {
                    $m.events.bind( 'click' , '#explorer' , function ( event ) {
                        var $target = $( event.target );
                        
                        switch ( true ) {
                            case $target.closest( '.music-song' ).length > 0 : $target = $target.closest( '.music-song' );
                            case $target.hasClass( 'music-song' ) :
                                var path = $target.attr('data-path');
                                $m.log ( 'Play music : ' + path );
                                $m.view.music.player.play( path , $target.find('.song-title').text() );
                                break;
                        }
                    });
                },
            
                initialize: function( path ) {
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.music').remove();
                            
                        var $folders = $('<div class="music type"></div>');
                        
                        var $table = $('<table class="table table-striped"></table>');
                        var $thead = $('<thead></thead>');
                        var $tbody = $('<tbody></tbody>');
                        
                        $folders.append( '<div class="title">' + path.replace( /.*\// , '' ) + '</div>' );
                        
                        //$thead.append( '<tr><th colspan="100">' + path.replace( /.*\// , '' ) + '</th></tr>' );
                        
                        var $tr = $('<tr></tr>');
                        for ( var d in $m.view.music.data ) {
                            $tr.append( '<th class="song-'+d+' '+$m.view.music.data[d].class+'">' + $m.view.music.data[d].title + '</th>' );
                        }
                        $thead.append( $tr );
                    
                        $folders.append( $table
                            .append( $thead )
                            .append( $tbody )
                        );
                        
                        $folder.append( $folders );
                        
                    }
                },
                
                load: function ( path , json ) {
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.type.music' ).length === 0 ) $m.view.music.initialize( path );
                    
                    var $tbody = $folder.find( '.music table tbody' );//$('<table class="table table-striped"></table>');
                    
                    var offset = $folder.find('.image, .album, .music-song').length;
                    
                    
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                        
                                var p = path + '/' + json[i];
                                
//                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
                                if ( json[i] ) {
                                
                                    var $tr = $('<tr class="music-song entry" data-path="'+p+'"></tr>');

                                    for ( var d in $m.view.music.data ) {
                                        $tr.append( '<td class="song-'+d+' '+$m.view.music.data[d].class+'"></td>' );
                                    }

                                    $tr.find('.song-track').text( $tbody.find('tr').length + 1 );
                                    $tr.find('.song-title').text( json[i] );

                                    console.log( 77777 , $tr )

                                    $tbody.append( $tr );
                                }
                                
                                i++; f[0]();
                                
                            } else f[1]();
                                
                            
                        },
                        function() {
                            console.log( 'here' , path , {
                                c:'music', a:'list', path: path,
                                offset: offset, limit: json.length
                            });
                            setTimeout(function(){// Why ???
                                $m.api.get({
                                    c:'music', a:'list', path: path,
                                    offset: offset, limit: json.length
                                },function(json){
                                    
                                    if ( json && json.length ) {
                                        for ( var i in json ) {
                                            var $tr = $tbody.find('.song-title:contains("'+json[i].path+'")');
                                            
                                            if ( $tr.length ) {
                                                $tr = $tr.closest('tr');
                                                for ( var d in $m.view.music.data ) {
                                                    $tr.find('.song-'+d).text( json[i][d] );
                                                }
                                            }
                                        }
                                    }
                                });
                            },500);
                        },
                        function() {
                            
                            $m.api.get({
                                c:'music', a:'list', path: path,
                                offset: offset, limit: json.length
                            },function(json){
                                
                                console.log( json )

                                if ( json && json.length ) {
                                    for ( var i in json ) {
                                        
                                        var p = path + '/' + json[i].path;
                                        
                                        var $tr = $tbody.find('.song-title:contains("'+json[i].title+'")');
                                        if ( $tr.length == 0 ) {
                                            $tr = $('<tr class="music-song" data-path="'+p+'" data-name="'+json[i].path+'"></tr>');
                                        
                                            console.log ( i , p , json[i] );

                                            for ( var d in $m.view.music.data ) {
                                                $tr.append( '<td class="song-'+d+' '+$m.view.music.data[d].class+'">'+
                                                    ( json[i][d] !== undefined ? json[i][d] : '' )+
                                                '</td>' );
                                            }

                                            $tbody.append( $tr );
                                        }
                                    }
                                }
                            });
                        }
                    ]; f[2]();
                },
                
                
                
                
                
                
                player: {
                    $elt: null,
                    audio: null,
                    
                    timeout: null,
                    tictac: 0,
                    delay: 5,
                    initialize: function () {
                        if ( $('#music-player').length == 0 ) {
                            
                            $('body').append( '<div id="mini-player">'+
                                '<div class="splash"><img src="" id="mini-player-splash-cover" /></div>'+
                                '<div class="progress-bar">'+
                                    '<div class="time-to-left">&nbsp;</div>'+
                                    '<div class="current-time">&nbsp;</div>'+
                                    '<div class="progress progress-striped">'+
                                        '<div class="bar"></div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="thumb"></div>'+
                                '<div class="controls" style="text-align: center; float: left;">'+
                                    '<button class="btn btn-link" style="margin-right: 1em;"><i class="icon-remove"></i></button>'+
                                    '<div class="btn-group">'+
                                        '<button class="btn btn-link"><i class="icon-step-backward"></i></button>'+
                                        '<button class="btn btn-link"><i class="icon-play"></i></button>'+
                                        '<button class="btn btn-link"><i class="icon-step-forward"></i></button>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="title">&nbsp;</div>'+
                            '</div>' );
                            
                            $('body').append( '<audio id="music-player" style="display: none;">'+
                                '<source src="" type="audio/ogg" />'+
                                '<source src="" type=\'audio/mpeg;codecs="mp3"\' />'+
                                '<source src="" type="audio/wav" />'+
                                '<source src="" type="audio/webm" />'+
                                '<source src="" type="audio/mp4" />'+
                                '<source src="" type="audio/aac" />'+
    //                            '<object id="audio-player-flash" type="application/x-shockwave-flash" data="js/player_mp3_js.swf" width="1" height="1">'+
    //                                '<param name="movie" value="js/player_mp3_js.swf">'+
    //                                '<param name="AllowScriptAccess" value="always">'+
    //                                '<param name="FlashVars" value="">'+
    //                            '</object>'+
                                'Your browser does not support the audio element.'+
                            '</audio>' );

                            $m.view.music.player.$elt = $('#mini-player');
                            $m.view.music.player.audio = $('#music-player').get(0);

                            $m.events.bind( 'click' , '#mini-player' , function ( event ) {
                                var $target = $( event.target );
                                
                                if ( !$target.hasClass('btn') ) $target = $target.parent();
                                
                                if ( $target.hasClass('thumb') ) {
                                
                                } else if ( $target.find('.icon-play').length ) {
                                    $m.view.music.player.play();
                                } else if ( $target.find('.icon-pause').length ) {
                                    $m.view.music.player.pause();
                                } else if ( $target.find('.icon-step-forward').length ) {
                                    $m.view.music.player.next();
                                } else if ( $target.find('.icon-step-backward').length ) {
                                    $m.view.music.player.previous();
                                } else if ( $target.find('.icon-remove').length ) {
                                    $m.view.music.player.$elt.addClass('closed');
                                }
                            });

                            $m.events.bind( 'ended' , '#music-player' , function ( event ) {
                                $m.view.music.player.next();
                            });
                                
                            $m.events.bind( 'playing' , '#music-player' , function ( event ) {
                                if ( $m.view.music.player.timeout ) clearTimeout( $m.view.music.player.timeout );
                            
                                $m.view.music.player.tictac = 0;
                                $m.view.music.player.delay = 5;

                                var f = function () {
                                    $m.view.music.player.updateTime();
                                    console.log( 'update time' );

                                    $m.view.music.player.tictac++;
                                    if ( $m.view.music.player.tictac > $m.view.music.player.delay ) {
                                        $m.view.music.player.delay = 5;
                                        //$m.view.view.music.splash(true);
                                    }

                                    if ( !$m.view.music.player.audio.ended ) {
                                        $m.view.music.player.timeout = setTimeout(f,1000);
                                    }
                                }

                                f();
                            });
                        }
                    },
                    
                    
                    
                    
                    
                    
                    
                    play: function ( path , title ) {
                
                        if ( $m.view.music.player.$elt === null ) $m.view.music.player.initialize();

                        if ( path !== undefined ) {
                            
                            $('.music-song[data-path="'+path+'"]').addClass('active').siblings('.active').removeClass('active');
                            
                            $m.view.music.player.$elt.removeClass('closed');
                            
                            $m.view.music.player.current = path;

                            // MP3 source URL generation :
                            var src = $m.api.utils.url('file','access',{ path: path });
                            console.log( 'src' , src );

                            //$('#audio-player > object').get(0).SetVariable("method:setUrl", src);
                            //document.getElementById('audio-player-flash').SetVariable("method:setUrl", src);

                            $('#music-player > source').attr('src',src)
                                .parent().attr('src',src);

                            var thumb = $m.api.utils.url('image','access',{ path: path.replace(/\/[^\/]+$/,''), mode: 'micro' });
                            $('#mini-player .thumb').html('<img onClick="$(this).click();" data-path="'+path.replace(/\/[^\/]+$/,'')+'" src="'+thumb+'"/>');

                            $('#splash-cover').attr('src',$m.api.utils.url('image','access',{ path: path.replace(/\/[^\/]+$/,''), mode: 'preview' }));

                            if ( !$m.state.focused ) {
                                $m.utils.notify({
                                    img: thumb,
                                    title: 'You are listening...',
                                    msg: title
                                });
                            }
                        }

                        if ( title !== undefined ) {
                            $('#mini-player .title').text( title );
                        }

                        $('#mini-player').addClass('playing').find('.icon-play')
                            .toggleClass('icon-play').toggleClass('icon-pause');

                        $m.view.music.player.audio.play();
                    },
                    pause: function () {
                
                        if ( $m.view.music.player.timeout ) clearTimeout( $m.view.music.player.timeout );

                        $m.view.music.player.audio.pause();

                        $m.view.music.player.tictac = 0;
                        $m.view.music.player.delay = Infinity;
//                        $m.view.music.splash();

                        $('#mini-player').removeClass('playing').find('.icon-pause')
                            .toggleClass('icon-play').toggleClass('icon-pause');

                    },
                    sibling: function ( direction ) {
                        if ( $m.view.music.player.current ) {
                            $m.api.get({c:'file',a:direction,path: $m.view.music.player.current},function(json){
                                if ( json.path ) {
                                    console.log( json );
                                    $m.view.music.player.play( json.path , json.name );
                                }
                            });
                        }
                    },
                    previous: function () { $m.view.music.player.sibling('previous') },
                    next: function () { $m.view.music.player.sibling('next') },
                    
                    updateTime: function () {
                
                        $('.current-time').text( $m.view.music.player.timeToString( $m.view.music.player.audio.currentTime ) );
                        
                        $('.music-song[data-path="'+$m.view.music.player.current+'"]').addClass('active').siblings('.active').removeClass('active');

                        if ( isFinite( $m.view.music.player.audio.duration ) ) {
                            $('.time-to-left').text( '-' + $m.view.music.player.timeToString( $m.view.music.player.audio.duration - $m.view.music.player.audio.currentTime ) );

                            $('.progress-bar .progress .bar').css( 'width' , Math.round($m.view.music.player.audio.currentTime/$m.view.music.player.audio.duration*100)+'%' );
                        } else {
                            $('.time-to-left').text( '' );
                            $('.progress-bar .progress .bar').css( 'width' , '100%' );
                        }
                    },
                    timeToString : function ( duration ) {
                        if ( isNaN(duration) ) return '';

                        var hours = Math.floor(duration/60/60), time = [];

                        if ( hours > 0 ) time.push(( hours < 10 ? '0' : '' ) + hours );

                        duration -= hours*60*60;
                        var minutes = Math.floor(duration/60);
                        time.push(( minutes < 10 ? '0' : '' ) + minutes );

                        duration -= minutes*60;
                        seconds = Math.floor(duration);
                        time.push(( seconds < 10 ? '0' : '' ) + seconds );

                        return time.join(':');
                    },
                }
                
            },
        }
    });
    
    $m.view.music.init();
    
})(jQuery);
