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
    
    // REF : http://stackoverflow.com/questions/8897289/how-to-check-if-element-is-off-screen
    jQuery.expr.filters.offscreen = function(el) {
        var p = $('.folder.active',$m.explorer.elt).scrollTop();
        return (
//            (el.offsetLeft + el.offsetWidth) < 0 
            ( el.offsetTop + el.offsetHeight) < p
//            || (el.offsetLeft > window.innerWidth || el.offsetTop > window.innerHeight)
            || ( -p + el.offsetTop > p+window.innerHeight)
        );
    };
    
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        explorer: {
            elt: $('#explorer'),
            nav: $('#explorer-tree-nav'),
            
            tree: {},
            
            init: function() {
            
                /*$(window).bind('mousedown',function(event){
                        
                }).bind('mousemove',function(event){
                        
                });*/
                
                // Swipe navigation for explorer:
                $(window).bind('touchstart mousedown',function(event){
                    if ( event.originalEvent.touches && event.originalEvent.touches.length > 0 ) {
                        event.pageX = event.originalEvent.touches[0].pageX;
                        event.pageY = event.originalEvent.touches[0].pageY;
                    }
                
                    $m.state.touch = {
                        startX: parseFloat(event.pageX),
                        startY: parseFloat(event.pageY)
                    }
                    
                })
                .bind('touchmove mousemove',function(event){
                
                    if ( $m.state.touch ) {
                        
                        if ( event.originalEvent.touches && event.originalEvent.touches.length > 0 ) {
                            event.pageX = event.originalEvent.touches[0].pageX;
                            event.pageY = event.originalEvent.touches[0].pageY;
                            
                            $m.state.touch.diffX = parseFloat(event.pageX) - $m.state.touch.startX;
                            $m.state.touch.diffY = parseFloat(event.pageY) - $m.state.touch.startY;
                        }
                        
                        if ( false && Math.abs($m.state.touch.diffX) > 150 ) {
                        
                            //$('body').css('cursor','ew-resize');
                        
                            if ( Math.abs($m.state.touch.diffY) < 100 ) {
                                if ( $m.state.touch.diffX > 150 ) {
                                    $prev = $('#explorer-tree-nav .active').prev();
                                    if ( $prev.length ) {
                                        $prev.find('a').click();
                                        $m.state.touch.startX = parseFloat(event.pageX)+150;
                                    }// else delete $m.state.touch
                                    
                                } if ( $m.state.touch.diffX < -150 ) {
                                    $next = $('#explorer-tree-nav .active').next();
                                    if ( $next.length ) {
                                        $next.find('a').click();
                                        $m.state.touch.startX = parseFloat(event.pageX)-150;
                                    }// else delete $m.state.touch
                                }
                            }
                        }
                        
                        if ( Math.abs($m.state.touch.diffX) > 10 ) event.preventDefault();
                        //else delete $m.state.touch;
                    }
                })
                .bind('touchend mouseup',function(event){
                    
                    if ( !event.originalEvent.touches ) {
                        $m.state.touch.diffX = parseFloat(event.pageX) - $m.state.touch.startX;
                        $m.state.touch.diffY = parseFloat(event.pageY) - $m.state.touch.startY;
                    }
                    
                    if ( Math.abs($m.state.touch.diffX) > 150 ) {
                    
                        //$('body').css('cursor','ew-resize');
                    
                        if ( Math.abs($m.state.touch.diffY) < 100 ) {
                            if ( $m.state.touch.diffX > 150 ) {
                                $prev = $('#explorer-tree-nav .active').prev();
                                if ( $prev.length ) {
                                    $prev.find('a').click();
                                    $m.state.touch.startX = parseFloat(event.pageX)+150;
                                }// else delete $m.state.touch
                                
                            } if ( $m.state.touch.diffX < -150 ) {
                                $next = $('#explorer-tree-nav .active').next();
                                if ( $next.length ) {
                                    $next.find('a').click();
                                    $m.state.touch.startX = parseFloat(event.pageX)-150;
                                }// else delete $m.state.touch
                            }
                        }
                        event.preventDefault();
                        return false;
                    }
                    
                    delete $m.state.touch;
                    //$('body').css('cursor','');
                });
                
                
            
                $m.events.bind( 'resize' , 'window' , $m.explorer.resize );
                $m.events.bind( 'orientationchange' , 'window' , $m.explorer.resize );
                
                $m.events.bind( 'focus' , 'window' , function( event ) { $m.state.focused = true; } );
                $m.events.bind( 'blur' , 'window' , function( event ) { $m.state.focused = false; } );
                $m.events.bind( 'popstate' , 'window' , function( event ) {
                    var e = event.originalEvent;
                    var state = e.state;
                    
                    if ( state ) {
                        console.log( 'Moving back to: ' + state.server + '://' + state.path , event );
                        $m.storage.set('state.server',state.server);
                        $m.explorer.goto( state.path , true );
                        
                        // 
                        //event.preventDefault();
                        //event.stopPropagation();
                        //return false;
                        //history.back();
                    }
                });
                
                
                $m.events.bind( 'click' , '#splash-screen' , function ( event ) {
                    var $target = $( event.target );
                    
                    switch ( true ) {
                        case $target.closest( '.close' ).length > 0: $target = $target.closest( '.close' );
                        case $target.hasClass( 'close' ):
                            $target.next().find('.content').empty().closest('#splash-screen').fadeOut();
                            if ( $m.state.playTimeout !== undefined ) {
                                $target.parent().find('.icon-pause').toggleClass('icon-play').toggleClass('icon-pause');
                                clearTimeout( $m.state.playTimeout );
                                delete $m.state.playTimeout;
                            }
                            break;
                        case $target.closest( '.play' ).length > 0: $target = $target.closest( '.play' );
                        case $target.hasClass( 'play' ):
                            $target.find('i').toggleClass('icon-play').toggleClass('icon-pause');
                            if ( $m.state.playTimeout !== undefined ) {
                                clearTimeout( $m.state.playTimeout );
                                delete $m.state.playTimeout;
                            } else {
                                
                                $m.state.playTimeout = setTimeout(function() {
                                    $target.next().click();
                                },4000);
                            }
                            break;
                        case $target.hasClass( 'next' ) || $target.closest( '.next' ).length > 0 :
                            var path = $target.closest('#splash-screen').find('.content .entry-show').attr('data-path');
                            var $loader = $target.closest('#splash-screen').find('.icon-spin').fadeIn();
                            $m.api.get({c:'file',a:'next',path: path},function(json){
                                if ( json && json.path ) {
                                    var $prev = $('.folder.active .entry[data-path="'+json.path+'"]',$m.explorer.elt);
                            
                                    if ( $prev.length ) { $prev.click(); }
                                }
                                $loader.fadeOut();
                                
                                // Continue the 4s slideshow:
                                if ( $m.state.playTimeout !== undefined ) {
                                    $m.state.playTimeout = setTimeout(function(){ $target.next().click(); },4000);
                                }
                            });
                            break;
                            break;
                        case $target.hasClass( 'prev' ) || $target.closest( '.prev' ).length > 0 :
                            var path = $target.closest('#splash-screen').find('.content .entry-show').attr('data-path');
                            var $loader = $target.closest('#splash-screen').find('.icon-spin').fadeIn();
                            $m.api.get({c:'file',a:'previous',path: path},function(json){
                                if ( json && json.path ) {
                                    var $prev = $('.folder.active .entry[data-path="'+json.path+'"]',$m.explorer.elt);
                            
                                    if ( $prev.length ) {
                                        $prev.click();
                                    }
                                }
                                $loader.fadeOut();
                            });
                            break;
                    }
                });
                
                $m.events.bind( 'click' , '#servers-dropdown .dropdown-menu' , function ( event ) {
                    var $li = $( event.target ).closest('li');
                    
                    if ( $li.hasClass('server') ) {
                        $li.addClass('active').siblings('.active').removeClass('active');
                        
                        if ( $li.length ) {
                            $li.addClass('active').siblings('.active').removeClass('active');
                            //$('#servers-dropdown .dropdown-toggle').css( 'background-image' , 'url("'+$li.find('img').attr('src')+'")' ).empty().html('&nbsp;');
                            $('#servers-dropdown .dropdown-toggle img').attr('src',$li.find('img').attr('src'));
                        }
                        
                        // Store the current path on the actual server:
                        if ( $m.state.server && $m.state.servers[$m.state.server] ) {
                            $m.state.servers[$m.state.server].path = $m.state.path;
                            $m.storage.set('state.servers',$m.state.servers);
                        }
                        
                        var url = $li.find('> a').attr('data-url');
                        if ( url !== undefined ) $m.state.api = url;
                        else {
                            var name = $li.find('> a').attr('data-name');
                            if ( undefined !== name && $m.state.servers[name] ) {
                                $m.state.api = $m.state.servers[name].url;
                                $m.storage.set('state.server',name);
                            }
                        }
                        
                        
                        // Save the new path to the UI 
                        $m.storage.set( 'state.api' , $m.state.api );
                        
                        var path = '';
                        if ( false && $m.state.server && $m.state.servers[$m.state.server] && $m.state.servers[$m.state.server].path ) {
                            path = $m.state.servers[$m.state.server].path;
                        }
                        
                        console.log( $m.state.server , path );
                       
                        setTimeout(function(){
                            $m.explorer.elt.empty();
                            $m.explorer.nav.empty();
                            $m.explorer.path(path);
                        },0);
                    }
                    
                });
                
                $m.events.bind( 'click' , '#explorer' , function ( event ) {
                    var $target = $( event.target );
                    
                    switch ( true ) {
                        case $target.hasClass( 'dropdown-toggle' ) || $target.closest( '.dropdown-toggle' ).length > 0 :
                        case $target.hasClass( 'folder-share' ) || $target.closest( '.folder-share' ).length > 0 :
                        case $target.hasClass( 'image-share' ) || $target.closest( '.image-share' ).length > 0 :
                            return false;
                            break;
                            
                        case $target.hasClass( 'folder-download' ) || $target.closest( '.folder-download' ).length > 0 :
                            var path = $target.closest('.entry').attr('data-path');
                            window.open($m.api.utils.url('file','zip',{path: path}), '_blank');
                            return false;
                            break;
                        
                        case $target.hasClass( 'delete-folder' ) || $target.closest( '.delete-folder' ).length > 0 :
                            var path = $target.closest('.album, .image').attr('data-path');
                            $m.explorer.events.deleteFolder( path );
                            return false;
                            break;
                            
                        case $target.hasClass( 'file-download' ) || $target.closest( '.file-download' ).length > 0 :
                            var path = $target.closest('.entry').attr('data-path');                            
                            
//                            var $a = $('<a target="_blank" href="'+$m.api.utils.url('file','download',{path: path})+'">&nbsp;</a>');
//                            $('body').append( $a );
//                            setTimeout(function(){
//                                $a.click();
//                            },150);
//                            $a.remove();
//                            window.location.href = $m.api.utils.url('file','download',{path: path});
                            window.open($m.api.utils.url('file','download',{path: path}), '_blank');
                            return false;
                            break;
                        
                        case $target.hasClass( 'entry-rename' ) || $target.closest( '.entry-rename' ).length > 0 :
                            var path = $target.closest('.entry').attr('data-path');
                            $m.utils.rename( path );
                            break;
                        
                        case $target.hasClass( 'image-cover' ) || $target.closest( '.image-cover' ).length > 0 :
                            var path = $target.closest('.image').attr('data-path');
                            $m.view.image.cover( path );
                            break;
                        
                        case $target.closest( '.image-rotate' ).length > 0 : $target = $target.closest( '.image-rotate' );
                        case $target.hasClass( 'image-rotate' ):
                            var angle = $target.attr('data-value');
                            var path = $target.closest('.image').attr('data-path');
                            
                            $m.api.put({ c: 'image', a: 'rotate', path: path, angle: angle
                            },function(json){
                                if ( json.status == 'success' ) {
                                    var $img = $('.image[data-path="'+path+'"] img');
                                    $img.attr('src', $img.attr('src') + '&t='+(new Date()).getTime() )
                                }
                            });
                            break;
                        
                        case $target.closest( '.album' ).length > 0 : $target = $target.closest( '.album' );
                        case $target.hasClass( 'album' ) :
                            var path = $target.attr('data-path').replace( /^[^:]+:\/\// , '' );
                            var nav = $( '#explorer-tree-nav a[data-path="'+path+'"]' );
                            if ( nav.length ) {// Already loaded folder
                                nav.trigger( 'click' );
                            } else {
                                
                                $('a[data-path="'+path+'"]',$m.explorer.elt).addClass('loading').siblings('.loading').removeClass('loading');
                                
                                $m.explorer.path( path , true );
                            }
                            return false;
                            break;
                        
                        case $target.closest( '.video-play' ).length > 0 : $target = $target.closest( '.video-play' );
                        case $target.hasClass( 'video-play' ):
                            var path = $target.closest('.entry').attr('data-path');
                            $m.view.video.stop( $target.closest('.entry') );
                            break;
                        
                        case $target.closest('.entry').length > 0: $target = $target.closest('.entry');
                        case $target.hasClass('entry'):
                            var type = $target.attr('class').replace(/ .*$/,'');
                            
                            if ( $m.view && $m.view[type] && typeof($m.view[type].show) == 'function' ) {
                                $m.view[type].show( $target );
                            }
                            
                            break;
                    }
                });
                
                $m.events.bind( 'dragover' , 'window' , function ( event ) {
                    event.originalEvent.preventDefault();
                });
                
                $m.events.bind( 'drop' , 'window' , function ( event ) {
                    var $target = $( event.target );
                    
                    event.originalEvent.stopPropagation();
                    event.originalEvent.preventDefault();
                    
                    if ( $target.closest('.album').length ) {
                        $target = $target.closest('.album');
                        $target.append('<div style="float: right; width: 100%; margin-top: -0.5em;" class="progress-bar upload-progress"><div class="progress progress-striped" style="height: 0.5em;margin: 0em;border-radius: 0px;"><div class="bar" style="width:0%;"></div></div></div>');
                        $m.utils.upload( event.originalEvent , $target.attr('data-path') );
                    } else if ( $target.closest('.column.folder.active').length ) {
                        var path = $target.closest('.column.folder.active').attr('data-path');
                        //console.log( 283 , path );
                        $target = $('.album[data-path="'+path+'"]');
                        $target.append('<div style="float: right; width: 100%; margin-top: -0.5em;" class="progress-bar upload-progress"><div class="progress progress-striped" style="height: 0.5em;margin: 0em;border-radius: 0px;"><div class="bar" style="width:0%;"></div></div></div>');
                        $m.utils.upload( event.originalEvent , path );
                    }
                    
                    event.stopPropagation();
                    event.preventDefault();
                });
                
                $m.events.bind( 'click' , '#explorer-tree-nav' , function ( event ) {
                    var $target = $( event.target );
                    var path = $target.attr('data-path');
                    if ( !$m.shared || path.match( new RegExp( $m.shared ) ) ) {
                        $m.explorer.goto( path );
                    }
                });
                
                // Menu actions :
                $m.events.bind( 'click' , '#menu-dropdown' , function ( event ) {
                    var $target = $( event.target );
                    if ( !$target.hasClass('btn') ) $target = $target.parent();
                });
                
                // Search form binding :
                $m.events.bind( 'keypress' , '#s' , function ( event ) {
                    
                    var keyCode = event.originalEvent.keyCode || event.originalEvent.which;
                    if (keyCode == '13'){
                        var search = $('#s').val();
                        
                        $('#filter-panel').addClass('loading');
                        
                        $m.api.get({
                            c:'file',
                            a:'search',
                            path: $m.state.path,
                            search: search
                        },
                        function( json ){
                            
                            $('#search-results').remove();
                            $('#filter-panel').removeClass('loading');
                            
                            if ( $('#search-results').length == 0 ) {
                                
                                var $results = $('<div id="search-results" class="column folder" data-level="0" data-path="search://'+$m.state.path+'" style="width: 100%;">'+
                                    '<div class="content"></div>'+
                                    '</div>');
                            
                                $m.explorer.elt.append( $results );
                                
                                $results.addClass('active').siblings('.active').removeClass('active');
                            
                                for ( var type in json ) {
                                    if ( type !== 'music' && $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                                        $m.view[type].load( 'search://'+$m.state.path , json[type] );
                                    }
                                }
                                
                                $('#s').blur();
                                
                                if ( $('.content > *',$results).length == 0 ) {
                                    $('.content',$results).append('<div style="text-align:center; padding: 3em; line-height: 1.5em; font-size: 2em; color: #aaa;">'+
                                            '<i class="icon-frown"></i> Sorry, no result found.<br/>'+
                                            '<span style="font-size: 0.75em; font-style: italic;">'+search+'</span>'+
                                        '</div>')
                                }
                            }
                        });
                        
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                });
                
                // Search form binding :
                $m.events.bind( 'click' , '#view-recents' , function ( event ) {
                    
                        
                    $('#search-results').remove();
                    
                    
                    var $results = $('<div id="search-results" class="column folder" data-level="0" data-path="search://'+''+'" style="width: 100%;">'+
                        '<div class="content"></div>'+
                        '</div>');
                
                    $m.explorer.elt.append( $results );
                    
                    $results.addClass('active').siblings('.active').removeClass('active');
                
                    var type = 'folder';
                    var folders = [];
                    for ( var i in $m.state.recents ) {
                        if ( undefined !== $m.state.recents[i] && $m.state.recents[i].match( new RegExp( '^'+$m.state.server+'://' ) ) ) {
                            
                            folders.push( $m.state.recents[i].replace(/^[^:]+:\/+/,'') );
                            
                        }
                    }
                    
                    //console.log( 368 , folders );
                    if ( type !== 'music' && $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                        $m.view[type].load( 'search://'+'' , folders.reverse() );
                    }
                    
                    if ( $('.content > *',$results).length == 0 ) {
                        $('.content',$results).append('<div style="text-align:center; padding: 3em; line-height: 1.5em; font-size: 2em; color: #aaa;">'+
                                '<i class="icon-frown"></i> Sorry, no result found.<br/>'+
                            '</div>')
                    }
                    
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                });
            
            },
            resize: function ( event ) {
                if ( !$m.state.resizing ) {
                    $m.state.resizing = true;
                    //$('.folder.active').animate({'opacity':0.5},200);
                    
                    setTimeout(function(){
                        //$('.folder.active').css('opacity',0.5);
                        $('.folder > .content > .type').each(function(i,o){
                            var $o = $(o);
                            var type = $o.attr('class').replace(/s? .*/,'');
                            
                            if ( $m.view && $m.view[type] && typeof($m.view[type].resize) == 'function' ) {
                                $m.view[type].resize( $o );
                            }
                            
                        });
                        $m.state.resizing = false;
                        //$('.folder.active').animate({'opacity':1});
                    },1);
                    //$('.folder.active').css('opacity',1);
                }
                if ( event !== undefined ) event.preventDefault();
                return false;
            },
            goto: function ( path , noHistory ) {
                var $folder = $('.folder[data-path="'+path+'"]');
                
                // Update the window title:
                document.title = ( !path || path == '' ? 'Home' : path.replace(/^.*\//,'') ) + ' - Mesh';
                
                // Update the browser history:
                if ( noHistory !== true ) {
                    history.pushState({
                        server: $m.state.server,
                        path: path
                    }, $m.state.server + ':' + path );//, window.location.href.replace(/#.*/,'') + '#' + path );
                    
                    if  ( -1 == $.inArray( $m.state.server+'://'+path , $m.state.recents ) ) {
                        if ( $m.state.recents.length > 10 ) $m.state.recents.shift();
                        $m.state.recents.push(
                            $m.state.server+'://'+path
                        );
                        $m.storage.set('state.recents',$m.state.recents);
                    }
                }
                
                if ( $folder.length ) {
                    
                    $('a[data-path="'+path+'"]',$m.explorer.nav).parent().addClass('active').siblings('.active').removeClass( 'active' );
                    
                    $('a[data-path="'+path+'"]',$m.explorer.elt).addClass('loading').siblings('.loading').removeClass('loading');
                    
                    setTimeout(function(){
                        if ( true ) {
                            $folder.addClass('active').addClass('fadein').siblings('.active').removeClass( 'active' );

                            setTimeout(function(){
                                $('a[data-path="'+path+'"]',$m.explorer.elt).removeClass('loading');
                                $folder.removeClass('fadein');
                                
                                if ( $('.content > * .entry',$folder).length === 0 ) $m.explorer.events.scroll();
                            },10);
                            /*$folder.siblings('.active').fadeOut(1000,function(){

                            })*/
                            //$folder.addClass('active').siblings('.active').removeClass( 'active' );
                            //$folder.siblings('.active').fadeOut(400,function(){
    //                            $folder.fadeIn(400,function(){
    //                                $folder.addClass('active').siblings('.active').removeClass( 'active' );
    //                            });
                            //})
                        } else if ( false ) {
                            $folder.addClass('active').siblings('.active').removeClass( 'active' );
                            $('a[data-path="'+path+'"]',$m.explorer.elt).removeClass('loading');
                        } else if ( true ) {
                            var direction = $folder.prevAll('.active').length ? true : false ;

                            var outgoing = ( direction ? 'in' : 'out' ) + 'going';
                            var ingoing = ( !direction ? 'in' : 'out' ) + 'going';

                            $folder.siblings('.active').addClass( outgoing );

                            setTimeout(function(){
                                $folder.addClass('active').addClass( ingoing ).focus();

                                setTimeout(function(){
                                    $folder.removeClass(ingoing);
                                    setTimeout(function(){

                                        $('a[data-path="'+path+'"]',$m.explorer.elt).removeClass('loading');

                                        $folder.siblings('.'+outgoing).removeClass('active').removeClass(outgoing);
                                    },1000);
                                }, 150);

                            }, 250 );
                        }
                    },150);
                }
                
                // Save the new path to the UI 
                $m.storage.set( 'state.path' , path );
            },
            refresh: function ( path ) {
                $('.column.folder[data-path="'+path+'"] > .content').each(function(i,o){ $(o).empty(); });
                if ( $('.column.folder[data-path="'+path+'"] .scroll-detector').length == 0 ) {
                    $('.column.folder[data-path="'+path+'"]').append('<div class="scroll-detector" onClick="$m.explorer.events.scroll();" style="text-align:center; line-height: 1.5em; font-size: 2em; color: #aaa;">'+
                                '<i class="icon-cloud-download"></i> Loading...<br/>'+
                                '<span style="font-size: 0.75em; font-style: italic;"></span>'+
                            '</div>');
                }
                setTimeout($m.explorer.events.scroll,50);
            },
            path: function ( path ) {
                if ( path === undefined ) return $m.state.path;
            
                var folders = path.split( '/' ); var c = folders.length;
                
                $m.state.loading = true;
                
                var $f = undefined;
                $.each(folders,function(i,o){
                    // Current folder absolute path :
                    var p = folders.slice(0,i+1).join('/');
                    var $folder = $('.folder[data-path="'+p+'"]');
                    
                    if ( $folder.length ) $f = $folder;
                    else if ( $f !== undefined && $f.length ) {
                        $m.explorer.nav.find( 'a[data-path="'+$f.attr('data-path')+'"]' ).parent().nextAll().remove();
                        $f.nextAll().remove();
                        return false;
                    } else if ( p != '' ) {
                        $m.explorer.nav.empty();
                        $('.folder').remove();
                    }
                });
                
                //$m.explorer.elt.css('width', ( 100 / $m.config.columns * (c-1) ) + '%' )
                
                //$('#explorer-tree-nav').empty();
                
                var i = folders.length-1;
                var f = [
                    function(){
                        if ( i >= 0 ) {
                            // Current folder absolute path :
                            var p = folders.slice(0,i+1).join('/');
                            
                            if ( undefined !== $m.shared && null === p.match( new RegExp( $m.shared ) ) ) return f[1]();
                            
                            if ( $('.folder[data-path="'+p+'"]').length == 0 ) {
                                // Update the navigation bar :
                                $m.explorer.prependNav( i , folders , p , c-i <= 2 );
                            
                                // Add folder to the explorer :
                                $m.explorer.addFolder( i , folders , p , 2 );
                                if ( i == folders.length-1 ) {
                                    $m.api.get({c:'file',a:'list',path: p,sort:'reserve'},function(json){
                                        
                                        for ( var type in json ) {
                                            if ( $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                                                $m.view[type].load( p , json[type] );
                                            }
                                        }
                                    
                                        // Move to the last folder :
                                        $m.explorer.goto( $m.explorer.elt.find('.folder:last-child').attr('data-path') );
                                        
                                        i--; setTimeout( f[0] , 100 );
                                    });
                                } else {
                                    i--; setTimeout( f[0] , 100 );
                                }
                            } else {
                                i--; f[0]();
                            }
                            
                        } else f[1]();
                    },
                    function(){
                        //$m.explorer.elt.find('.folder:last-child').addClass('active');
                        //$m.explorer.goto( $m.explorer.elt.find('.folder:last-child').attr('data-path') );
                        $m.state.loading = false;
                        
                        // Share toek building:
                        var sharedToken = $m.api.utils.token({
                            shared: true,
                            url: $m.state.servers[ $m.state.server ].url,
                            path: path,
                            auth: $m.state.servers[ $m.state.server ].share
                        });
                        console.log( 'sharedToken' , sharedToken );
                        
                        setTimeout(function(){
                            $m.explorer.events.scroll();
                        },1000);
                    }
                ]; f[0]();
            },
            prependNav: function ( level , folders , path , visible ) {
                var name = folders[level];
                //$m.explorer.nav.prepend('<li'+( visible ? ' class="visible"' : '' )+'><span class="divider">/</span><a data-path="'+path+'" href="javascript:void(0);">'+( path == '' ? '<i class="icon-home" style="pointer-events: none;"></i>' : name )+'</a></li>');
                $link = $( '<li'+( visible ? ' class="visible"' : '' )+' data-level="'+level+'">'+
                            '<span class="divider">/</span>'+
                            '<a data-path="'+path+'" href="javascript:void(0);">'+( path == '' ? '<i class="icon-home" style="pointer-events: none;"></i>' : name )+'</a>'+
                        '</li>');
                
                if ( $m.explorer.nav.find('li[data-level="'+(level-1)+'"]').length ) {
                    $m.explorer.nav.find('li[data-level="'+(level-1)+'"]').after( $link );
                } else if ( $m.explorer.nav.find('li[data-level="'+(level+1)+'"]').length ) {
                    $m.explorer.nav.find('li[data-level="'+(level+1)+'"]').before( $link );
                } else {
                    var $li = $m.explorer.nav.find('li:last-child');
                    if ( $li.length ) {
                        var l = parseInt($li.attr('data-level'),10);
                        if ( l < level ) $m.explorer.nav.append( $link );
                        else $m.explorer.nav.prepend( $link );
                    } else $m.explorer.nav.prepend( $link );
                }
            },
            addFolder: function ( level , folders , path , c ) {
                var name = folders[level];
                
                if ( $('.folder[data-path="'+path+'"]').length == 0 ) {
                    
                    var $column = $('<div class="column folder" data-level="'+level+'" id="'+path.replace(/[^0-9a-z]/gi,'-')+'" data-path="'+path+'" style="width: '+(100/(c-1))+'%;"></div>');
                    var $content = $('<div class="content"></div>');
                    
                    //$content.append( '<div class="name">' + name + '</div>' );
                    
                    //$column.append('<div >Loading...</div>');
                    $column.append('<div class="scroll-detector" onClick="$m.explorer.events.scroll();" style="text-align:center; line-height: 1.5em; font-size: 2em; color: #aaa;">'+
                                        '<i class="icon-cloud-download"></i> Loading...<br/>'+
                                        '<span style="font-size: 0.75em; font-style: italic;"></span>'+
                                    '</div>');
                    
                    $column.prepend( $content );
                    
                    //$column.prepend( '<div class="quick-links"></div>' );
                    
                    if ( $('.folder[data-level="'+(level-1)+'"]').length ) {
                        $('.folder[data-level="'+(level-1)+'"]').after( $column );
                    } else if ( $('.folder[data-level="'+(level-1)+'"]').length ) {
                        $('.folder[data-level="'+(level-1)+'"]').before( $column );
                    } else {
                        var $folder = $('.folder:last-child');
                        if ( $folder.length ) {
                            var l = parseInt($folder.attr('data-level'),10);
                            if ( l < level ) $m.explorer.elt.append( $column );
                            else $m.explorer.elt.prepend( $column );
                        } else $m.explorer.elt.prepend( $column );
                    }
                    
                    $m.explorer.nav.parent().scrollLeft(1e9);
                    
                    // Prepare the folder element with ordered parts:
                    if ( $m && $m.state && $m.state.typesOrder ) {
                        for ( var i in $m.state.typesOrder ) {
                            var type = $m.state.typesOrder[i];
                            if ( $m.view && $m.view[type] && typeof($m.view[type].initialize) == 'function' ) {
                                console.log('Initialize: '+type);
                                $m.view[type].initialize( path );
                            }
                        }
                    }
                    
                    $m.events.bind( 'scroll' , '#'+path.replace(/[^0-9a-z]/gi,'-') , $m.explorer.events.scroll );
                    
                }
            },
            
            
            helper: {
                modal: function ( content , id ) {
                    id = undefined !== id ? id : 'modal';
                    content = undefined !== content ? content : {};
                    
                    //prompt( 'Share' , url );
                    $('#'+id).remove();
                    
                    var $modal = $('<div id="'+id+'" class="modal hide fade server-authentication" tabindex="-1" role="dialog" aria-labelledby="server-initialization" aria-hidden="true">'+
                        '<div class="modal-header">Modal</div>'+
                        '<div class="modal-body"></div>'+
                        '<div class="modal-footer">'+
                            '<button class="btn" data-dismiss="modal">Close</button>'+
                        '</div>'+
                    '</div>');
                    
                    if ( undefined !== content.header ) $('.modal-header',$modal).html( content.header );
                    if ( undefined !== content.body ) $('.modal-body',$modal).html( content.body );
                    if ( undefined !== content.footer ) $('.modal-footer',$modal).html( content.footer );
                    
                    //console.log( content , $modal );
                    
                    $('body').append( $modal );
                    
                    $modal.modal('show').on('hidden', function () {
                        if ( typeof(content.onhidden) === 'function' ) content.onhidden(id);
                        $(this).remove();
                    }).on('shown', function () {
                        if ( typeof(content.onshown) === 'function' ) content.onshown(id);
                    });;
                }
            },
            
            events: {
                scroll: function ( event ) {
                    
//                    $('.folder.active .entry.image:offscreen').css('visibility','hidden');
//                    $('.folder.active .entry.image:not(:offscreen)').css('visibility','visible');
                    
                    if ( $m.state.loading != true ) {
                        
                        $('.folder.active .scroll-detector',$m.explorer.elt).each(function(i,o){
                            o = $(o);
                            var position = o.position();

                            if ( position.top < window.screen.height * 2 ) {
                                
                                $m.state.loading = true;
                                
                                var $folder = $('.folder.active',$m.explorer.elt);
                                var p = $folder.attr('data-path');
                                var request = {
                                    c:'file',a:'search',
                                    path: p, offset: $folder.find('.entry, .image, .album, .music-song, .pdf').length,
                                };

                                if ( $('#search').val() ) request['search'] = $('#search').val();

                                $m.api.get(request,function(json){
                                    
                                    // Filter inputs already loaded :
                                    for ( var type in json ) {
                                        for ( var i in json[type] ) {
                                            if ( $('.entry[data-path$="'+json[type][i]+'"]',$folder).length ) {
                                                json[type].splice(i, 1);
                                            }
                                        }
                                    }
                                    
                                    processing = false;
                                    for ( var type in json ) {
                                        if ( json[type].length > 0 ) {
                                            processing = true;
                                            break;
                                        }
                                    }
                                    
                                    var processed = false;
                                    if ( processing ) {
                                        for ( var type in json ) {
                                            if ( $m.view && $m.view[type] && typeof($m.view[type].load) == 'function' ) {
                                                processed = true;
                                                $m.view[type].load( p , json[type] );
                                            }
                                        }
                                    }

                                    if ( !processed ) {
                                        $('.folder.active .scroll-detector',$m.explorer.elt).remove();
                                    }
                                    setTimeout(function(){ $m.state.loading = false; }, 1000 );

                                });
                            }
                        });
                    }
                },
                
                createFolder: function ( event ) {
                    var name = prompt( 'Folder name :' );
                    
                    if ( name != '' && !name.match(/^\./) && confirm('Are you sure you want to create this folder ?') ) {
                        $m.api.post({ c:'file', a:'folder', path: $m.state.path, name:name},function(json){
                            
                            $m.view.folder.load( $m.state.path , [ name ] );
                            
                        });
                    }
                },
                deleteFolder: function ( path ) {
            
                    if ( confirm( 'Are you sure you want to remove the folder "'+path+'" ? This can not be undone.' ) ) {
                        $m.api.delete_({ c: 'file', a: 'delete', path: path },function(json){
                            if ( json.status == 'success' ) {
                                if ( $('.album[data-path="'+path+'"]').length ) {
                                    $('.album[data-path="'+path+'"]').remove();

                                    $('.folder[data-path="'+path+'"]').nextAll().andSelf().remove();

                                    $('#explorer-tree-nav a[data-path="'+path+'"]').closest('li').nextAll().andSelf().remove();
                                } else if ( $('*[data-path="'+path+'"]').length ) {
                                    $('*[data-path="'+path+'"]').remove();
                                }
                                
                            }
                        });
                    }
                }
            }
            
        },

    });
    
    $m.explorer.init();
    
})(jQuery);
