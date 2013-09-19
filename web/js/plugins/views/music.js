(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            music: {
                data: {
                    //track : { title:'#', class: 'tablet' },
                    status: { title:'', class: 'phone' },
                    title : { title:'Title', class: 'phone' },
                    duration: { title:'<i class="icon-time">&nbsp;</i>', class: 'phone' },
                    //album : { title:'Album', class: 'tablet' },
                    //artist: { title:'Artist', class: 'tablet' },
                    
                    //'year'  : 'Year',
                    //'genre': 'Genre',
                    actions: { title:'', class: 'phone' },
                },
                init: function () {
                    $m.events.bind( 'click' , '#explorer' , function ( event ) {
                        var $target = $( event.target );
                        
                        switch ( true ) {
                            case $target.closest('.music-song .btn-group').length > 0:
                                return false;
                        
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
                        
                        var partId = $folder.closest('.folder').attr('id')+'__music';
                        var $folders = $('<div class="music type" id="'+partId+'" style="display: none;"></div>');
                        
                        var $table = $('<table class="table table-striped" style="margin-top: -0.3em;"></table>');
                        var $thead = $('<thead></thead>');
                        var $tbody = $('<tbody></tbody>');
                        
                        //$folders.append( '<div class="title">' + path.replace( /.*\// , '' ) + '</div>' );
                        
                        //$thead.append( '<tr><th colspan="100">' + path.replace( /.*\// , '' ) + '</th></tr>' );
                        
                        var $tr = $('<tr></tr>');
                        for ( var d in $m.view.music.data ) {
                            $tr.append( '<th class="song-'+d+' '+$m.view.music.data[d].class+'">' + $m.view.music.data[d].title + '</th>' );
                        }
                        $thead.append( $tr );
                    
                        $folders.append( '<div class="music-details">'+
                            '<div class="album-cover smartphone"></div>'+
                            '<div class="album-background">'+
                                '<div class="album-artist"></div>'+
                                '<div class="album-album"></div>'+
                                '<div class="album-infos">'+
                                    '<span class="album-duration"></span>'+
                                    '<span class="album-genre"></span>'+
                                '</div>'+
                            '</div>'+
                        '</div>' );
                        
                        $folders.append( $table
                            .append( $thead )
                            .append( $tbody )
                        );
                        
                        //$folders.append( '<div class="title">' + path.replace( /.*\// , '' ) + '</div>' );
                        
                        $folder.prev().append('<a href="#'+partId+'" class="quick-music" style="display: none;">Music</a>');
                        
                        $folder.append( $folders );
                        
                    }
                },
                
                load: function ( path , json ) {
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.type.music' ).length === 0 ) $m.view.music.initialize( path );
                    else $folder.find( '.type.music' ).show();
                    
                    var $tbody = $folder.find( '.music table tbody' );//$('<table class="table table-striped"></table>');
                    
                    var offset = $folder.find('.image, .album, .music-song').length;
                    
                    
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                                
                                $folder.prev().find('.quick-music').show();
                        
                                var p = path + '/' + json[i];
                                
                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
//                                if ( json[i] ) {
                                
                                    var $tr = $('<tr class="music-song entry" data-path="'+p+'"></tr>');

                                    for ( var d in $m.view.music.data ) {
                                        $tr.append( '<td class="song-'+d+' '+$m.view.music.data[d].class+'"></td>' );
                                    }

                                    $tr.find('.song-track').text( $tbody.find('tr').length + 1 );
                                    $tr.find('.song-title').text( json[i] );

                                    $tbody.append( $tr );
                                }
                                
                                 setTimeout(function(){ i++; f[0](); },25);
                                
                            } else f[1]();
                                
                            
                        },
                        function() {
                            /*
                            //setTimeout(function(){// Why ???
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
                            //},500);
                            */
                        },
                        function() {
                        
                            console.warn( 143 , (new Date()).getTime() );
                        
                            $m.api.get({
                                c:'music', a:'list', offset: $folder.find('.music-song').length , limit:100, path: path,
                                offset: offset, limit: json.length
                            },function(json){

                                console.warn( 147 , json );

                                if ( json && json.length ) {
                                
                                    var year = '';
                                    var album = '';
                                    var artist = '';
                                    var genre = '';
                                    
                                    console.log( 169 , json )
                                
                                    for ( var i in json ) {
                                    
                                        // Update the album year:
                                        if ( year == '' && json[i].year != '' ) year = json[i].year;
                                        if ( album == '' && json[i].album != '' ) album = json[i].album;
                                        if ( artist == '' && json[i].artist != '' ) artist = json[i].artist;
                                        if ( genre == '' && json[i].genre != '' ) genre = json[i].genre;
                                        
                                        var p = path + '/' + json[i].path;
                                        
                                        if ( $folder.find('*[data-path="'+p+'"]').length ) {
                                            break;
                                        }
                                        
                                        var $tr = $tbody.find('.song-title:contains("'+json[i].title+'")');
                                        if ( $tr.length == 0 ) {
                                            $tr = $('<tr class="music-song" data-path="'+p+'" data-name="'+json[i].path+'"></tr>');
                                        
                                            for ( var d in $m.view.music.data ) {
                                            
                                                $tr.append( '<td class="song-'+d+' '+$m.view.music.data[d].class+'">'+
                                                    ( json[i][d] !== undefined ? json[i][d] : '' ) +
                                                        ( d !== 'actions' ? '' :
                                                            '<div class="btn-group">'+
                                                                '<span class="btn" onClick="javascript:$m.view.music.utils.download(\''+p+'\')"><i class="icon-download-alt"></i></span>'+
                                                                '<span class="btn" onClick="javascript:$m.view.music.utils.mp3info(\''+p+'\')"><i class="icon-info"></i></span>'+
                                                            '</div>'
                                                        )+
                                                '</td>' );
                                            }

                                            $tbody.append( $tr );
                                        }
                                    }
                                    
                                    // Displaying album details:
                                    var $details = $folder.find( '.music-details' );
                                    
                                    //var album = $tbody.find('.song-album').first().text();
                                    //var artist = $tbody.find('.song-artist').first().text();
                                    var duration = 0;
                                    $('.song-duration',$tbody).each(function(i,o){
                                        var d = $(o).text().split(':').reverse();
                                        var unit = 1;
                                        for ( var i in d ) {
                                            duration += parseInt(d[i],10) * unit;
                                            unit *= 60;// sec -> min -> hour
                                            if ( i == 2 ) break;
                                        }
                                    });
                                    
                                    if ( artist != '' ) $details.find('.album-artist').text( artist );
                                    if ( album != '' ) $details.find('.album-album').text( album );
                                    if ( year != '' ) $details.find('.album-album').append( $( '<span> &nbsp;(' + year + ')</span>' ) );
                                    if ( genre != '' ) $details.find('.album-genre').text( 'Genre: '+ genre );
                                    
                                    if ( !isNaN( duration ) ) {
                                        var $duration = $details.find('.album-duration').empty();
                                        var dd = [], unit = 3600;
                                        for ( var i = 0 ; i < 3 ; i++ ) {
                                            var r = Math.floor( duration / unit );
                                            dd[i] = ( i > 0 && r < 10 ? '0' : '' )+r;
                                            duration -= r * unit;
                                            unit /= 60;
                                        }
                                        $duration.html( '<i class="icon-time">&nbsp;</i> ' + dd.join(':') );
                                    }
                                    
                                    if ( $folder.find('.image.entry:first').length ) {
                                        $details.find('.album-cover').andSelf().css( 'background-image' , 'url(\''+$folder.find('.image.entry:first img').attr('src')+'\')' )
                                    }
                                }
                            });
                        }
                    ]; f[2]();
                },
                
                
                
                
                utils: {
                
                    mp3info: function ( path ) {
                    
                        if ( undefined !== path ) {
                        
                            console.log( 'MP3 infos...' , path );
                            $m.api.get({ c: 'music', a: 'infos', path: path },function( json ) {
                                console.log( path , json );
                                
                                var body = '<form class="form-horizontal"><div class="row-fluid">';
                                body += '<input type="hidden" name="path" value="'+path+'"/>';
                                for ( var key in json ) {
                                    body += '<div class="control-group">';
                                        body += '<label class="control-label" for="music-info-'+key+'">'+key+'</label>';
                                        body += '<div class="controls">';
                                            body += '<input type="text" id="music-info-'+key+'" name="'+key+'" value="'+json[key]+'" class="span12"/>';
                                        body += '</div>';
                                    body += '</div>';
                                }
                                body += '</div></form>';
                                
                                var footer = '<button class="btn" data-dismiss="modal">Close</button>'+
                                             '<button class="btn" onClick="$m.view.music.utils.mp3info();">Save</button>';
                                
                                $m.explorer.helper.modal({
                                    header: 'MP3 information',
                                    body: body,
                                    footer: footer
                                },'modal-music-infos');
                                
                            });
                            
                        } else if ( $('#modal-music-infos').length ) {
                        
                            var infos = {};
                            $('#modal-music-infos input[type="text"]').each(function(i,o){
                                infos[ $(o).attr('name') ] = $(o).val();
                            });
                            
                            console.log( 295 , $('#modal-music-infos input[name="path"]').val() , infos );
                            $m.api.put($.extend(infos,{
                                c: 'music', a: 'infos',
                                path: $('#modal-music-infos input[name="path"]').val()
                                }),function( json ) {
                                    console.log( 301 , json );
                            });
                            
                        }
                    
                    },
                
                    download: function ( path ) {
                        
                        console.log( 'download...' , path );
                        $m.api.get({ c: 'file', a: 'access', path: path , base64: true },function( json ) {
                            //var data = Base64.decodeToHex( json.base64.replace( /^data:([^;]*);base64,/ , '' ));
                            //var data = Base64.decodeToHex( json.base64 );
                            var data = json.base64;
                            //var data = 'data:audio/mpeg;base64,/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
                            var mime = json.base64.replace( /^data:([^;]*);base64,.*/ , '$1' )
                            var filename = path.replace(/^.*\//,'');
                            var folder = path.replace(/\/[^\/]+$/,'');
                            
                            console.log('hhhhhh');
                            $('#music-player > source').attr('src',data)
                                .parent().attr('src',data);
                            
                            $m.view.music.player.audio.play();
                            
                            console.log( filename , data.length , data.substring(0,50) , mime );
                            return;
                            
                            $m.storage.fs.set( folder , filename ,
                                Base64.decode( json.base64.replace( /^data:([^;]*);base64,/ , '' )) ,
                                function(){
                                    console.log( 'ok' );
                                    $.ajax({
                                        url: 'filesystem:http://192.168.0.22/persistent/local/Musique/Aphex%20Twin/Come%20to%20Daddy/02%20Flim.mp3',
                                        //type: 'arraybuffer',
                                        success: function ( response ) {
                                            console.log( response.length );
                                        }
                                    });
                                },
                                {
                                    type: mime
                                });
                        });
                    },
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
                                //'<div class="splash"><img src="" id="mini-player-splash-cover" /></div>'+
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
                                '<embed src="" height="1" width="1">'+
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
                    
                    
                    
                    
                    
                    
                    __play: function ( path , title ) {
                
                        if ( $m.view.music.player.$elt === null ) $m.view.music.player.initialize();

                        if ( path !== undefined ) {
                            
                            $('.music-song[data-path="'+path+'"]').addClass('active').siblings('.active').removeClass('active');
                            
                            $m.view.music.player.$elt.removeClass('closed');
                            
                            $m.view.music.player.current = path;

                            // MP3 source URL generation :
                            var src = $m.api.utils.url('file','access',{ path: path });

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
                    play: function ( path , title ) {
                
                        if ( $m.view.music.player.$elt === null ) $m.view.music.player.initialize();

                        if ( path !== undefined ) {
                        
                            (function(path,title){
                                var filename = path.replace(/^.*\//,'');
                                var folder = path.replace(/\/[^\/]+$/,'');
                                
                                var _play = function ( base64 ) {
                                
                                    $('.music-song .song-status').empty();
                                
                                    $('.music-song[data-path="'+path+'"]').addClass('active').siblings('.active').removeClass('active');
                                    
                                    $('.music-song[data-path="'+path+'"] .song-status').html('<i class="icon-play" style="position: absolute; left: 0.5em;"></i>');
                                
                                    $m.view.music.player.$elt.removeClass('closed');
                                    
                                    $m.view.music.player.current = path;

                                    // MP3 source URL generation :
                                    var src = undefined !== base64 ? base64 : $m.api.utils.url('file','access',{ path: path });
                                    
                                    //$('#audio-player > object').get(0).SetVariable("method:setUrl", src);
                                    //document.getElementById('audio-player-flash').SetVariable("method:setUrl", src);

                                    $('#music-player > *').attr('src',src).attr('data',src)
                                        .parent().attr('src',src).attr('data',src);

                                    var thumb = $m.api.utils.url('image','access',{ path: path.replace(/\/[^\/]+$/,''), mode: 'micro' });
                                    $('#mini-player .thumb').html('<img onClick="$m.explorer.goto(\''+path.replace(/\/[^\/]+$/,'')+'\',true);" data-path="'+path.replace(/\/[^\/]+$/,'')+'" src="'+thumb+'"/>');

                                    $('#splash-cover').attr('src',$m.api.utils.url('image','access',{ path: path.replace(/\/[^\/]+$/,''), mode: 'preview' }));

                                    if ( !$m.state.focused ) {
                                        $m.utils.notify({
                                            img: thumb,
                                            title: 'You are listening...',
                                            msg: title
                                        });
                                    }
                                    
                                    if ( title !== undefined ) {
                                        $('#mini-player .title').text( title );
                                    }

                                    $('#mini-player').addClass('playing').find('.icon-play')
                                        .toggleClass('icon-play').toggleClass('icon-pause');

                                    $m.view.music.player.audio.play();
                                    
                                    if ( !$m.state.focused ) {
                                        $m.utils.notify({
                                            img: thumb,
                                            title: 'You are listening...',
                                            msg: title
                                        });
                                    }
                                }
                                
                                // Comment the line below to activate the local storage for MP3
                                // input files: works on chrome 27+ desktop but not on Android (beta)
                                return _play();
                            
                                $m.storage.fs.get(folder,filename,function( content , fileEntry ){
                                    //alert(content);
                                    
                                    //console.log( content );
                                    if ( content !== '' ) {// Local File System cache management
                                        _play(content);
                                    } else {
                                        $m.api.get({ c: 'file', a: 'access', path: path , base64: true },function( json ) {
                                            var data = json.base64;
                                            
                                            _play(data);
                                            
                                            $m.storage.fs.set(folder,filename,data);
                                        });
                                    }
                                });
                            })(path,title);
                            
                        }
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
