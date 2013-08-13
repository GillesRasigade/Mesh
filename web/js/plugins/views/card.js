(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
            card: {
                init: function () {
                    $('#menu-dropdown .dropdown-menu .divider.last').before( '<li><a href="javascript:$m.explorer.events.createFolder(event);"><i class=" icon-folder-open"></i> Create a folder</a></li>' )
                    
                    $m.view.card.form.init();
                },
                
                config: {
                    panel: 'explorer-card-panel',
                    folders: 'explorer-card-folder',
                    objects: 'explorer-card-cards'
                },
                columns: {
                    width: 320, number: 3,
                },
                setColumns: function( $folder , $folders ) {
                
                    $folders.empty();
                
                    if ( $(window).width() < 480 ) $m.view.card.columns.width = $(window).width();
                    else $m.view.card.columns.width = 320;
                    
                    $m.view.card.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.card.columns.width ));
                    
                    for ( var i = 0 ; i < $m.view.card.columns.number ; i++ ) {
                        $folders.append('<div class="column" style="width: '+(100/$m.view.card.columns.number)+'%;"><div class="column-content"></div></div>');
                    }
                    
                    return $folders;
                },
                
                initialize: function ( path ) {
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.length ) {
                    
                        $folder.find('.cards').remove();
                        
                        var partId = $folder.closest('.folder').attr('id')+'__card';
                        var $folders = $('<div class="cards type entries" id="'+partId+'"></div>');
                        
                        $m.view.card.setColumns($folder,$folders);
                        
                        $folder.prev().append('<a href="#'+partId+'" class="quick-card" style="display: none;">Cards</a>');
                        
                        $folder.append( $folders );
                    }
                },
                
                resize: function ( $folders ) {
                    var $entries = $('.entry',$folders).clone();
                    
                    $m.view.card.setColumns($folders.parent(),$folders);
                    
                    $entries.sort(function(a,b){
                        //return $(a).attr('data-path').toLowerCase() - $(b).attr('data-path').toLowerCase();
                        if($(a).attr('data-path') < $(b).attr('data-path')) return -1;
                        if($(a).attr('data-path') > $(b).attr('data-path')) return 1;
                        return 0;
                    });
                    
                    $entries.each(function(i,o){
                        // Photo positioning :
                        var c = i%$m.view.card.columns.number+1;
                        var h = -1; var column = c !== undefined ? c : 1;
                        var $f = $folders.parent().parent();
                        for ( var c = 1 ; c <= $m.view.card.columns.number ; c++ ) {
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
                
                create: function () {
                    var card = {};
                    var p = $('#card-creation-form *[name="path"]').val();
                    $.each($('#card-creation-form').serializeArray(), function(_, kv) { card[kv.name] = kv.value; });
                    
                    $('#card-creation-form *[name="path"]').val('');
                    
                    $card = $m.view.card.get( card , p );
                    
                    if ( card.path != '' ) {
                        $m.api.put($.extend( card , { c:'card', a:'update' } ),function(json){
                            $('#card-creation-form').get(0).reset();
                            
                            $('.cards .card[data-path="'+p+'"]').html( $card.html() );
                            
                        });
                    } else {
                        $m.api.post($.extend( card , { c:'card', a:'create', path: $m.state.path } ),function(json){
                            $('#card-creation-form').get(0).reset();
                            
                            $m.explorer.elt.trigger('scroll');
                            
                        });
                    }
                },
                update: function ( event ) {
                    var $target = $( event.target ).closest('.card');
                    
                    $m.api.get({ c: 'file', a: 'access', path: $target.attr('data-path') },function( json ) {
                        $('#card-creation-form *[name="path"]').val( $target.attr('data-path') );
                    
                        $.each($('#card-creation-form').serializeArray(), function(_, kv) {
                            if ( json[kv.name] !== undefined ) {
                                $('#card-creation-form *[name="'+kv.name+'"]').val( json[kv.name] );
                            }
                        });
                        
                        $('a[href="#card-creation"]').trigger('click');
                    });
                    
                },
                remove: function ( event ) {
                    if ( confirm('Are you sure ?') ) {
                        var $target = $( event.target ).closest('.card');
                        
                        $m.api.delete_({ c: 'file', a: 'delete', path: $target.attr('data-path') },function(json){
                            if ( json.status == 'success' ) {
                                $target.remove();
                            }
                        });
                    }
                },
                get: function ( card , path ) {
                    $card = $('<div class="card entry" data-path="'+path+'"></div>');
                    
                    var type = 'default';
                    
                    $card.append('<div class="card-category">&nbsp;</div>');
                    
                    var title = card.title ? card.title : '';
                    var body = card.body ? card.body : '';
                    
                    // Body formatting :
                    body = body.replace( /\n/ , '<br/>' );
                    
                    if ( card.media && card.media !== '' ) {
                        type = 'image';
                        
                        $img = $('<div class="card-image"></div>');
                            
                        switch ( true ) {
                            case card.media.match ( /^https?:\/\// ) !== null:
                                $img.append('<img src="'+card.media+'" />');
                                break;
                            case card.media.match ( /^<iframe/ ) !== null:
                            case card.media.match ( /^<svg/ ) !== null:
                                $img.html( card.media );
                                break;
                        }
                        
                        $card.append($img);
                    }
                    
                    if ( title ) $card.append('<div class="card-title">'+title+'</div>')
                    if ( body ) $card.append('<div class="card-body">'+body+'</div>')
                    
                    $footer = $('<div class="card-footer"></div>');
                    $footer.append('<a title="updated at : '+card.updatedAt+'" class="details icon-question-sign"></a>');
                    
                    // Addition of tags :
                    if ( card.tags ) {
                        var tags = card.tags.split(',');
                        var t = [];
                        for ( var tag in tags ) {   
                            t.push( '<a href="#">' + tags[tag].trim() + '<a>' );
                        }
                        
                        $footer.append( '<span class="tags">'+t.join(', ')+'</span>' );
                    }
                    $footer.append('<div class="actions">'+
                        '<a href="#" onClick="$m.view.card.update(event);"><i class="icon-edit"></i></a> &nbsp; '+
                        '<a href="#" onClick="$m.view.card.remove(event);"><i class="icon-trash"></i></a>'+
                    '</div>');
                    
                    // Addition of the reference :
                    if ( card.references ) {
                        var references = card.references.split(',');
                        $references = $('<ul class="references"></ul>');
                        for ( var ref in references ) {
                            $references.append('<li class="reference"><a target="_blank" href="'+references[ref].trim()+'">'+references[ref].trim()+'</a></li>')
                        }
                        $card.append( $references );
                    }
                    
                    $card.append($footer);
                    //if ( tags ) $card.append('<div class="card-body">'+body+'</div>')
                    
                    $card.addClass( type );
                    
                    return $card;
                },
                load: function ( path , json ) {
                    
                    var $folder = $( '.folder[data-path="'+path+'"] .content' );
                    
                    if ( $folder.find( '.cards' ).length === 0 ) $m.view.card.initialize( path );
                    
                    var i = 0;
                    var f = [
                        function () {
                            if ( i < json.length ) {
                                
                                $folder.prev().find('.quick-card').show();
                                
                                var p = path + '/' + json[i];
                                
                                if ( json[i] && $('.entry[data-path="'+p+'"]').length == 0 ) {
//                                if ( json[i] ) {

                                    // Photo positioning :
                                    var h = -1; var column = c !== undefined ? c : 1;
                                    var $f = $folder.parent();
                                    for ( var c = 1 ; c <= $m.view.card.columns.number ; c++ ) {
                                        var $c = $folder.find('.cards > .column:nth-child('+c+') > .column-content');

                                        if ( !$f.hasClass('active') )
                                            $f.css({'position':'absolute','visibility':'hidden', 'display':'block'});

                                        var height = $c.height();

                                        if ( !$f.hasClass('active') )
                                            $f.css({'position':'','visibility':'', 'display':''});


                                        if ( h == -1 || height < h ) {
                                            h = height; column = c;
                                        }
                                    }

                                    $card = $('<div class="card entry" data-path="'+p+'" style="display: none;"></div>');
                                    $folder.find('.cards > .column:nth-child('+column+') > .column-content').append( $card );

                                    $m.api.get({ c: 'file', a: 'access', path: p },function( data ) {

                                        $c = $m.view.card.get( data , p );
                                        
                                        $('.entry[data-path="'+p+'"]').replaceWith( $c ).fadeIn();

                                        setTimeout(function(){ i++; f[0](); },25);
                                    });
                                } else {
                                    i++; f[0]();
                                }
                            }
                        }
                    ];
                    f[0]();
                },
                
                
                
                
                
                form: {
                    init: function () {
                        // Add DOM modal window to create a new card :
                        $('body').append('<div id="card-creation" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="card-creation" aria-hidden="true">'+
                            '<div class="modal-header">Card creation</div>'+
                            '<div class="modal-body">'+
                                '<form id="card-creation-form">'+
                                '<div class="row-fluid">'+
                                    '<input type="hidden" name="path" value=""/>'+
                                    '<input type="text" name="title" placeholder="title" class="span12"/>'+
                                    //'<textarea name="abstract" placeholder="abstract" class="span12"></textarea>'+
                                    '<textarea name="body" placeholder="body" class="span12" rows="5"></textarea>'+
                                    '<hr/>'+
                                    '<input type="text" name="media" placeholder="media (ie: http://..., <svg>..., ...)" class="span12"/>'+
                                    '<input type="text" name="tags" placeholder="tags (ie: french, writer, hugo)" class="span12"/>'+
                                    '<input type="text" name="references" placeholder="references (ie: http://..., ...)" class="span12"/>'+
                                    /*'<select name="type" class="span12">'+
                                        '<option value="default">Default</option>'+
                                        '<option value="image">Image</option>'+
                                    '</select>'+*/
                                    '<input type="hidden" name="type" value="image" />'+
                                '</div>'+
                                '</form>'+
                            '</div>'+
                            '<div class="modal-footer">'+
                                '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                                '<button class="btn btn-primary" data-dismiss="modal" onClick="$m.view.card.create();">Save changes</button>'+
                            '</div>'+
                        '</div>');
                    }
                }
            }
        }
    });
    
    $m.view.card.init();
    
})(jQuery);
