(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            pdf: {
                
                config: {
                    viewer: false,
                },
            
                src: function ( path , mode ) {
                    return $m.api.utils.url('pdf','access',{
                        path: path, mode: mode !== undefined ? mode : 'full'
                    });
                },
            
            
                columns: {
                    width: 320, number: 3,
                },
                
                setColumns: function( $folder , $folders ) {
                
                    $folders.empty();
                
                    $m.view.pdf.columns.width = $m.utils.getWidth();
                    
                    $m.view.pdf.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.pdf.columns.width / $m.state.scale ));
                    
                    for ( var i = 0 ; i < $m.view.pdf.columns.number ; i++ ) {
                        $folders.append('<div class="column" style="width: '+(100/$m.view.pdf.columns.number)+'%;"><div class="column-content"></div></div>');
                    }
                    
                    return $folders;
                },
                
                initialize: function( path ) {
            
                    if ( window.navigator !== undefined && navigator.mimeTypes !== undefined ) {
                        for ( var i in navigator.mimeTypes ) {
                            if ( navigator.mimeTypes[i] && navigator.mimeTypes[i].type && navigator.mimeTypes[i].type.match(/pdf/) ) {
                                $m.view.pdf.config.viewer = true;
                                break;
                            }
                        }
                    }
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.pdfs').remove();
                        
                        var partId = $folder.closest('.folder').attr('id')+'__pdf';
                        var $folders = $('<div class="pdfs type" id="'+partId+'"></div>');
                        
                        $m.view.pdf.setColumns($folder,$folders);
                        
                        $folder.prev().append('<a href="#'+partId+'" class="quick-pdf" style="display: none;">PDFs</a>');
                        
                        $folder.append( $folders );
                    }
                
                },
                
                resize: function ( $folders ) {
                    var $entries = $('.entry',$folders).clone();
                    
                    $m.view.pdf.setColumns($folders.parent(),$folders);
                    
                    $entries.sort(function(a,b){
                        //return $(a).attr('data-path').toLowerCase() - $(b).attr('data-path').toLowerCase();
                        if($(a).attr('data-path') < $(b).attr('data-path')) return -1;
                        if($(a).attr('data-path') > $(b).attr('data-path')) return 1;
                        return 0;
                    });
                    
                    $entries.each(function(i,o){
                        // Photo positioning :
                        var h = -1; var column = Math.ceil(Math.random()*$m.view.pdf.columns.number);
                        var $f = $folders.parent().parent();
                        for ( var c = 1 ; c <= $m.view.pdf.columns.number ; c++ ) {
                            var $c = $folders.find('> .column:nth-child('+c+') > .column-content');


                            if ( !$f.hasClass('active') )
                                $f.css({'position':'absolute','visibility':'hidden', 'display':'block'});

                            var height = $c.height();
                            console.log(height,h);

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
                    
                    if ( $folder.find( '.pdfs' ).length === 0 ) $m.view.pdf.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                                
                                $folder.prev().find('.quick-pdf').show();
                        
                                var p = path+'/'+json[i];
                                
                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
//                                if ( json[i] ) {
                                
                                    // Photo positioning :
                                    var h = -1; var column = Math.ceil(Math.random()*$m.view.pdf.columns.number);
                                    var $f = $folder.parent();
                                    for ( var c = 1 ; c <= $m.view.pdf.columns.number ; c++ ) {
                                        var $c = $folder.find('.pdfs > .column:nth-child('+c+') > .column-content');


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
                                    if ( title.match(/^[\d-,]+ /) ) {
                                        details.push( title.replace(/^([\d-,]+) .*/,'$1') );
                                        title = title.replace(/^[\d-,]+ /,'');
                                    }

                                    //title="'+json['folder'][i]+'"
                                    var $div = $('<div title="Open this pdf file" target="_blank" data-path="'+p+'" href="'+$m.view.pdf.src(p)+'" class="pdf entry">'+
                                            '<img class="pdf-img" src="'+$m.view.pdf.src(p,'thumb')+'" style="height: auto; padding: 0px; margin: 0px; border: 0px;"/>'+
//                                            '<span class="actions">'+
//                                                '<div class="btn btn-link file-download"><i class="icon-download"></i></div>'+
//                                            '</span>'+
                                            '<span title="'+json[i]+'" class="pdf-title">'+title+'</span>'+
                                            '<span class="pdf-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</div>');

                                    $folder.find('.pdfs > .column:nth-child('+column+') > .column-content').append($div);
                                }
                                
                                setTimeout(function(){ i++; f[0](); },25);
                            } else f[1]();
                        },
                        function() {
                            
                            $('.pdf .pdf-title.details:not(.updated)').first().each(function(i,o){
                                var $o = $(o).addClass('updated');
                                var p = $o.closest('.album').attr('data-path');
                            });
                        }
                    ]; f[0]();
                },
                
                show: function ( $entry ) {
                    
                    var $splash = $('#splash-screen');
                    var path = $entry.attr('data-path');
                    var src = $entry.attr('href');
                    
                    if ( $m.view.pdf.config.viewer ) {
                    
                        //$splash.fadeOut();
                        if ( !$splash.is(':visible') ) $splash.fadeIn();

                        $('.content',$splash).empty().show()
                            .append('<iframe src="'+src+'" class="entry-show" style="background: #eee; width: 100%; height: 100%; max-width: 100%; max-height: 100%; margin: -1px; border: 0px;" data-path="'+path+'"></iframe>');

                        return false;
                    } else {
                        window.location = src;
                    }
                },
                        
            },
        }
    } );
})(jQuery);
