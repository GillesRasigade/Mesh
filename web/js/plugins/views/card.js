(function($){
    window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
        view: {
            card: {
                initialized: false,
                init: function () {
                    
                    if ( !$m.view.card.initialized ) {
                        if ( $m.state.permissions.post ) {
                            $('#menu-dropdown .dropdown-menu .divider.last').before( '<li><a href="#card-creation" role="button" data-toggle="modal"><i class="icon-pencil"></i> Create a card</a></li>' )
                        }
                        
                        $m.view.card.form.init();
                        
                        $m.view.card.initialized = true;
                    }
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
                
                    $m.view.card.columns.width = $m.utils.getWidth();
                    
                    $m.view.card.columns.number = Math.max( 1 , Math.ceil( $folder.parent().width() / $m.view.card.columns.width / $m.state.scale ));
                    
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
                    
                    console.log( 99 , card );
                    
                    $card = $m.view.card.get( card , p );
                    
                    if ( card.path != '' ) {
                        $m.api.put($.extend( card , { c:'card', a:'update' } ),function(json){
                            $('#card-creation-form').get(0).reset();
                            
                            $('.cards .card[data-path="'+p+'"]').html( $card.html() );
                            
                            var ps = p.replace(/^[^:]+:\/\//,'').replace(/[^\/]+$/,'');
                            var file = p.replace(/^.*\//,'');
                            $m.storage.fs.remove(ps,file);
                            
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
                        
                        $m.view.card.editor.setValue( json.body , true ).focus();
                        
                        $('a[href="#card-creation"]').trigger('click');
                    });
                    
                },
                remove: function ( event ) {
                    if ( confirm('Are you sure ?') ) {
                        var $target = $( event.target ).closest('.card');
                        
                        $m.api.delete_({ c: 'file', a: 'delete', path: $target.attr('data-path') },function(json){
                            if ( json.status == 'success' ) {
                                $target.remove();
                                
                                var path = $target.attr('data-path');
                                var ps = path.replace(/^[^:]+:\/\//,'').replace(/[^\/]+$/,'');
                                var file = path.replace(/^.*\//,'');
                                $m.storage.fs.remove(ps,file);
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
                    body = body.replace( /\n/g , '<br/>' );
                    
                    if ( card.media && card.media !== '' ) {
                        type = 'image';
                        
                        $img = $('<div class="card-image"></div>');
                            
                        switch ( true ) {
                            case card.media.match ( /^(https?:)?\/\// ) !== null:
                                $img.append('<img src="'+card.media+'" />');
                                break;
                            case card.media.match ( /^<iframe/ ) !== null:
                            case card.media.match ( /^<svg/ ) !== null:
                                $img.html( card.media );
                                break;
                        }
                        
                        $card.append($img);
                    }
                    
                    if ( title ) {
                        if ( card.references ) {
                            title = '<a href="'+card.references.replace(/(^,|,.*$)/g,'')+'" target="_blank">' + title + '</a>';
                        }
                        $card.append('<div class="card-title">'+title+'</div>');
                    }
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
                        var references = card.references.replace(/(^,|,$)/,'').split(',');
                        $references = $('<ul class="references"></ul>');
                        for ( var ref in references ) {
                            var url = references[ref].trim();
                            var name = url;
                            
                            if ( url.match(/^"([^"]+)":(.*)$/) ) {
                                name = url.replace(/^"([^"]+)":(.*)$/,'$1');
                                url = url.replace(/^"([^"]+)":(.*)$/,'$2');
                            }
                        
                        
                            $references.append('<li class="reference"><a target="_blank" href="'+url+'">'+name+'</a></li>')
                        }
                        $card.append( $references );
                    }
                    
                    $card.append($footer);
                    //if ( tags ) $card.append('<div class="card-body">'+body+'</div>')
                    
                    $card.addClass( type );
                    
                    return $card;
                },
                load: function ( path , json ) {
                
                    if ( !$m.view.card.initialized ) $m.view.card.init();
                    
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
                                    
                                    var ps = p.replace(/^[^:]+:\/\//,'').replace(/[^\/]+$/,'');
                                    var file = p.replace(/^.*\//,'');
                                    $m.storage.fs.get(ps,file,function( content ){
                                    
                                        var g = [function(data,p){
                                            console.log( 256 , data );
                                            
                                            $m.storage.fs.set(ps,file,JSON.stringify( data ));
                                            
                                            $c = $m.view.card.get( data , p );
                                    
                                            $('.entry[data-path="'+p+'"]').replaceWith( $c ).fadeIn();

                                            setTimeout(function(){ i++; f[0](); },25);
                                        }];
                        
                                        if ( content !== '' ) {
                                            g[0](JSON.parse( content ),p)
                                        } else {
                                    
                                            $m.api.get({ c: 'file', a: 'access', path: p },function( data ) {
                                            
                                                if ( data.title.match(/^wiki:/) ) {
                                                    $m.view.card.source.wiki(p,data,function(data){
                                                        g[0](data,p);
                                                    });
                                                    
                                                } else g[0](data,p);
                                                
                                            });
                                            
                                        }
                                    });
                                } else {
                                    i++; f[0]();
                                }
                            } else return f[1]();
                        },
                        // Loading external cards data
                        function(){
                            return;
                            var titles = undefined;
                            $folder.find('.entry.card:not(.loading) .card-title:contains(wiki:)').each(function(i,o){
                                if ( !titles ) titles = {};
                                titles[ $(o).closest('.entry').addClass('loading').attr('data-path') ] = $(o).text();
                            });
                            if ( undefined !== titles ) $m.view.card.source.wiki(titles);
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
                                    '<div id="card-creation-body-toolbar" class="btn-group commands" style="margin-bottom: 1px;">'+
                                      '<span data-wysihtml5-command="bold" class="btn btn-small_ command" href="javascript:;" unselectable="on"><i class="icon-bold"></i>&nbsp;</span>'+
                                      '<span data-wysihtml5-command="italic" class="btn btn-small_ command" href="javascript:;" unselectable="on"><i class="icon-italic"></i>&nbsp;</span>'+
                                      
                                      '<span data-wysihtml5-command="insertUnorderedList" class="btn btn-small_ command" href="javascript:;" unselectable="on"><i class="icon-list-ul"></i>&nbsp;</span>'+
                                      '<span data-wysihtml5-command="insertOrderedList" class="btn btn-small_ command" href="javascript:;" unselectable="on"><i class="icon-list-ol"></i>&nbsp;</span>'+
                                      
                                      '<span data-wysihtml5-command="createLink" class="btn btn-small_ command" href="javascript:;" unselectable="on"><i class="icon-link"></i>&nbsp;</span>'+
                                      '<span data-wysihtml5-command="insertImage" class="btn btn-small_ command" href="javascript:;" unselectable="on"><i class="icon-picture"></i>&nbsp;</span>'+
                                      
                                      '<span data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1" class="btn btn-small_ command" href="javascript:;" unselectable="on">H1</span>'+
                                      '<span data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2" class="btn btn-small_ command" href="javascript:;" unselectable="on">H2</span>'+
                                    '</div>'+
                                    //'<div data-wysihtml5-dialog="createLink" style="display: none;">        <label>          Link:          <input data-wysihtml5-dialog-field="href" value="http://">        </label>        <a data-wysihtml5-dialog-action="save">OK</a>&nbsp;<a data-wysihtml5-dialog-action="cancel">Cancel</a>      </div>      <div data-wysihtml5-dialog="insertImage" style="display: none;">        <label>          Image:          <input data-wysihtml5-dialog-field="src" value="http://">        </label>        <a data-wysihtml5-dialog-action="save">OK</a>&nbsp;<a data-wysihtml5-dialog-action="cancel">Cancel</a>      </div>'+
                                    '<textarea id="card-creation-body" name="body" placeholder="body" class="span12" rows="25" style="height: 20em;"></textarea>'+
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
                        
                        setTimeout(function(){
                            $m.view.card.editor = new wysihtml5.Editor('card-creation-body', { // id of textarea element
                                toolbar:      "card-creation-body-toolbar", // id of toolbar element
                                parserRules:  wysihtml5ParserRules // defined in parser rules set 
                            });
                            
                            $('body').css('height',(window.screen.height/5*4)+'px');
                            setTimeout(function(){ $('body').css('height','100%'); }, 250);
                            
                        },1000);
                    }
                },
                
                source: {
                    wiki: function ( path , data , callback ) {
                        var $card = $('.entry[data-path="'+path+'"]');
                        var title = data.title.replace(/^[^:]+:/,'');
                        $card.removeClass('default').addClass('image').find('.card-title').html( title + ' - <i>Loading...</i>' );
                        
                        $.ajax({
                            url: 'http://fr.wikipedia.org/w/api.php',
                            dataType: 'jsonp',
                            data: {
                                action:'parse',
                                page:title,
                                prop:'text',
                                section:0,
                                format:'json',
                                disablepp:true,
                                redirects:true,
                            },
                            success: function ( json ) {
                                console.log( 341 , json , data.media );
                                if ( json.parse ) {
                                
                                    // Extracting useful information only:
                                    var $html = $(json.parse.text['*']);
                                    
                                    data.type = 'image';
                                    data.references = 'http://fr.wikipedia.org/wiki/'+json.parse.title+','+data.references;
                                    if ( data.media == '' ) {
                                        var $image = $html.find('.thumbimage').first();
                                        if ( $image.length == 0 ) $image = $html.find('.image img').first();
                                        
                                        if ( $image.length ) {
                                            //data.media = $image.attr('src').replace(/\/[0-9]+px-([^\/]+)$/,'/'+$m.view.card.columns.width+'px-$1');
                                            data.media = $image.attr('src');//.replace(/\/[0-9]+px-([^\/]+)$/,'/'+$m.view.card.columns.width+'px-$1');
                                        }
                                    }
                                    
                                    console.log( data.media , $html.siblings('p').first() )
                                    
                                    data.title = $('<a href="http://fr.wikipedia.org/wiki/'+json.parse.title+'" target="_blank"/>').text( json.parse.title ).html();
                                    var $p = $html.siblings('p').first();
                                    if ( $p.length ) {
                                        $p.find('.error, br:last-child').remove();
                                        data.body = $p.html().replace(/href="\//g,'href="http://fr.wikipedia.org/') + data.body;
                                    }
                                }
                                
                                if ( typeof(callback) === 'function' ) callback(data);
                            }
                        });
                    },
                    __wiki: function ( titles , callback ) {
                        console.log( 316 , titles );
                        var paths = Object.keys(titles);
                        var f = [function(){
                            if ( paths.length ) {
                                var path = paths.shift();
                                
                                var $card = $('.entry[data-path="'+path+'"]');
                                var title = titles[path].replace(/^[^:]+:/,'');
                                $card.removeClass('default').addClass('image').find('.card-title').html( title + ' - <i>Loading...</i>' );
                                
                                $.ajax({
                                    url: 'http://fr.wikipedia.org/w/api.php',
                                    dataType: 'jsonp',
                                    data: {
                                        action:'parse',
                                        page:title,
                                        prop:'text',
                                        section:0,
                                        format:'json',
                                        disablepp:true,
                                        redirects:true,
                                    },
                                    success: function ( json ) {
                                        console.log( 341 , json );
                                        if ( json.parse ) {
                                        
                                            setTimeout(function(){ f[0](); },25);
                                            
                                            // Extracting useful information only:
                                            var $html = $(json.parse.text['*']);
                                            
                                            // Addition of a new image:
                                            if ( $card.find('.card-image').length == 0 ) {
                                                var $image = $html.find('.thumbimage').first();
                                                if ( $image.length ) {
                                                    $image.attr('src',$image.attr('src').replace(/\/[0-9]+px-([^\/]+)$/,'/'+$m.view.card.columns.width+'px-$1') );
                                                
                                                    $card.find('.card-category').after( $('<div class="card-image"/>').append($image) );
                                                }
                                            }
                                            
                                            $card
                                                .find('.card-title').html( $('<a href="http://fr.wikipedia.org/wiki/'+json.parse.title+'" target="_blank"/>').text( json.parse.title ) )
                                                .after(
                                                    $('<div class="card-body"/>').append(
                                                        $html.siblings('p').first().html().replace(/href="\//g,'href="http://fr.wikipedia.org/')
                                                    )
                                                );
                                            
                                            $card.removeClass('loading');
                                        }
                                    }
                                });
                            }
                        }];
                        f[0]();
                    }
                }
                
            }
        }
    });
    
    //$m.view.card.init();
    
})(jQuery);
