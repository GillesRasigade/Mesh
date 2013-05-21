(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
        
            pdf: {
            
                src: function ( path , mode ) {
                    return $m.api.utils.url('pdf','access',{
                        path: path, mode: mode !== undefined ? mode : 'full'
                    });
                },
            
            
                columns: {
                    width: 320, number: 3,
                },
                initialize: function( path ) {
                
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.pdfs').remove();
                            
                        var $folders = $('<div class="pdfs type"></div>');
                        
                        $m.view.pdf.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.pdf.columns.width ));
                    
                        for ( var i = 0 ; i < $m.view.pdf.columns.number ; i++ ) {
                            $folders.append('<div class="column" style="width: '+(100/$m.view.pdf.columns.number)+'%;"><div class="column-content"></div></div>');
                        }
                        
                        $folder.append( $folders );
                    }
                
                },
                
                load: function ( path , json ) {    
                
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.pdfs' ).length === 0 ) $m.view.pdf.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                        
                            if ( i < json.length ) {
                        
                                var p = path+'/'+json[i];
                                
//                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
                                if ( json[i] ) {
                                
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
                                    var $div = $('<a title="Open this pdf file" target="_blank" data-path="'+p+'" href="'+$m.view.pdf.src(p)+'" class="pdf">'+
                                            '<img class="pdf-img" src="'+$m.view.pdf.src(p,'thumb')+'" style="height: auto; padding: 0px; margin: 0px; border: 0px;"/>'+
                                            //'<span class="actions"><i class="icon-remove delete-file"></i></span>'+
                                            '<span title="'+json[i]+'" class="pdf-title">'+title+'</span>'+
                                            '<span class="pdf-title details">&nbsp;'+( details.length ? details.join(' - ') + ' &nbsp;' : '' ) +'</span>'+
                                        '</a>');

                                    $folder.find('.pdfs > .column:nth-child('+column+') > .column-content').append($div);
                                }
                                
                                i++; f[0]();
                            } else f[1]();
                        },
                        function() {
                            
                            $('.pdf .pdf-title.details:not(.updated)').first().each(function(i,o){
                                var $o = $(o).addClass('updated');
                                var p = $o.closest('.album').attr('data-path');
                            });
                        }
                    ]; f[0]();
                }
            },
        }
    } );
})(jQuery);
