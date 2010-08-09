/**
 * TinyMCE Embed plugin
 *
 * A plugin that let's users paste embeded code such as YouTube videos, Google Maps into the document.
 * NOTE: This plugin requires the TinyMCE Media plugin.
 *
 * Icon: Mark James, http://www.famfamfam.com/lab/icons/silk/ (CC 2.5)
 *
 */

(function()
{
    tinymce.PluginManager.requireLangPack( 'embed' );

    var imagePlaceHolderPattern = /^(mceItemIframe|mceItemFlash|mceItemShockWave|mceItemWindowsMedia|mceItemQuickTime|mceItemRealMedia)$/;

    tinymce.create( 'tinymce.plugins.embed', {
        init : function( ed, url )
        {
            var t = this;

            function isImagePlaceHolder( n )
            {
                return imagePlaceHolderPattern.test(n.className);
            }

            t.url = url;
            t.editor = ed;
            t.embed_iframe_innerhtml_fallback = ( ed.settings.embed_iframe_innerhtml_fallback ) ? ed.settings.embed_iframe_innerhtml_fallback : 'This browser does not support the iframe element.';

            ed.onPreInit.add(function() {
                ed.serializer.addRules('iframe[_iframe_innerhtml|align<bottom?left?middle?right?top|class|frameborder|height|id|longdesc|marginheight|marginwidth|name|scrolling<auto?no?yes|src|style|title|width|type]');
            });

            ed.onInit.add( function()
            {
                if ( ed.settings.content_css !== false )
                {
                    ed.dom.loadCSS( url + "/css/embed.css" );
                }
            } );

            ed.addCommand( 'enonicEmbed', function()
            {
                ed.windowManager.open( {
                    file : url + '/window.html',
                    width : 620 + ed.getLang( 'embed.delta_width', 0 ),
                    height : 540 + ed.getLang( 'embed.delta_height', 0 ),
                    inline : 1
                }, {
                    plugin_url : url
                } );
            } );

            ed.addButton( 'embed', {
                title : 'embed.desc',
                cmd : 'enonicEmbed',
                image : url + '/img/embed.gif'
            } );

            ed.onNodeChange.add( function( ed, cm, n )
            {
                cm.setActive( 'embed', isImagePlaceHolder( n ) );
            } );

            ed.onBeforeSetContent.add( function( ed, o )
            {
                o.content = t.iframesToSpans( o.content );
            });

            ed.onSetContent.add( function( ed, o )
            {
                t.spansToImages( o.node );
            } );

            ed.onPreProcess.add( function( ed, o )
            {
                if ( o.set )
                {
                    o.content = t.iframesToSpans( o.content );
                    t.spansToImages( o.node );
                }

                if ( o.get )
                {
                    t.imagesToIframes( o );
                }
            } );

            ed.onPostProcess.add( function( ed, o )
            {
                if ( o.get )
                {
                    o.content = o.content.replace(/(<iframe.+?)_iframe_innerhtml="(.+?)"(.+?)(<\/iframe>)/gi, function() {
                        var innerHTML = t.editor.dom.decode(arguments[2]).replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');

                        return arguments[1] + tinymce.trim(arguments[3]) + innerHTML + arguments[4];
                    });
                }
            } );
        },


        getInfo : function()
        {
            return {
                longname  : 'Embed Plug-in',
                author    : 'tan@enonic.com',
                authorurl : 'http://www.enonic.com',
                infourl   : 'http://www.enonic.com',
                version   : "1.1"
            };
        },

        
        iframesToSpans : function( content )
        {
            var t = this;
            
            return content.replace(/<iframe\s*(.*?)>(|[\s\S]+?)<\/iframe>/gim, function() {
                var replacement = '<span ';

                replacement += arguments[1];
                replacement += ' _class="mceItemIframe">';
                replacement += t.editor.dom.encode(arguments[2]);
                replacement += '</span>';

                return replacement;
            });
        },


        spansToImages: function( node )
        {
            var t = this,
                    editor = t.editor,
                    dom = editor.dom,
                    imagePlaceHolder;

            var spans = dom.select( 'span[_class="mceItemIframe"]', node );

            tinymce.each( spans, function( span )
            {
                imagePlaceHolder = t.createImagePlaceHolder( span );

                dom.replace( imagePlaceHolder, span );
            } );
        },


        imagesToIframes : function( o )
        {
            var t = this,
                    editor = t.editor,
                    dom = editor.dom,
                    iframe;

            var imagePlaceHolders = dom.select( 'img[class="mceItemIframe"]', o.node );

            tinymce.each( imagePlaceHolders, function( img )
            {
                iframe = t.createIframeElement( img );
                dom.replace( iframe, img );
            } );
        },


        createImagePlaceHolder : function( span )
        {
            var t = this,
                    editor = t.editor,
                    dom = editor.dom,
                    image,
                    title,
                    width,
                    height,
                    iframeInnerHTMLAttrib,
                    iframeInnerHTML;

            width = dom.getAttrib( span, 'width' );
            height = dom.getAttrib( span, 'height' );
            title = t._serializeIframeAttributes( span );

            iframeInnerHTML = span.innerHTML.replace(/^\s+|\s+$/g, '');

            iframeInnerHTML = iframeInnerHTML !== '' ? iframeInnerHTML : t.embed_iframe_innerhtml_fallback;

            // Lowercase tags for IE.
            iframeInnerHTML = iframeInnerHTML.replace(/<(.+?)>/gim, function () {
                return '<'+arguments[1].toLowerCase()+'>';
            });

            title += ',"innerhtml":"'+iframeInnerHTML+'"';

            image = dom.create( 'img' );

            dom.setAttrib( image, 'src', t.url + '/img/trans.gif' );
            dom.setAttrib( image, 'title', title );
            dom.setAttrib( image, 'width', width );
            dom.setAttrib( image, 'height', height );
            dom.addClass( image, 'mceItemIframe' );

            // For some reason IE will not set the img.width attribute if the image is not fully loaded(onload).
            dom.setStyle( image, 'width', width );
            dom.setAttrib( image, 'style', 0 );

            return image;
        },

        
        createIframeElement : function( imagePlaceHolder )
        {
            var t = this,
                    editor = t.editor,
                    dom = editor.dom,
                    innerHTML = '',
                    iframe,
                    width,
                    height;

            var attribsForIframe = t._parseImagePlaceHolderTitle( imagePlaceHolder );
            
            if ( 'innerhtml' in attribsForIframe )
            {
                innerHTML = attribsForIframe.innerhtml;
                delete attribsForIframe.innerhtml;
            }

            width = dom.getAttrib( imagePlaceHolder, 'width' );
            height = dom.getAttrib( imagePlaceHolder, 'height' );
            iframe = dom.create( 'iframe', attribsForIframe );

            dom.setAttrib( iframe, 'width', width );
            dom.setAttrib( iframe, 'height', height );
            dom.setAttrib( iframe, '_iframe_innerhtml', innerHTML );

            return iframe;
        },


        _parseImagePlaceHolderTitle : function( imagePlaceHolder )
        {
            var t = this,
                    editor = t.editor,
                    placeHolderTitle = editor.dom.getAttrib( imagePlaceHolder, 'title' );

            return tinymce.util.JSON.parse('{' + placeHolderTitle + '}');
        },


        _serializeIframeAttributes : function( iframe )
        {
            var t = this,
                    editor = t.editor,
                    dom = editor.dom,
                    iframeHasValidAttrib,
                    validAttrib,
                    iframeAttrib,
                    attribsForPlaceHolder = {};

            var xhtml1TransitionalAttribs = ['src', 'width', 'height', 'longdesc', 'name', 'frameborder', 'marginwidth', 'marginheight', 'scrolling', 'align', 'id', 'class', 'style', 'title', 'type'];

            for ( var key in xhtml1TransitionalAttribs )
            {
                validAttrib = xhtml1TransitionalAttribs[key];
                iframeAttrib = dom.getAttrib( iframe, validAttrib );

                iframeHasValidAttrib = iframeAttrib !== '';

                if ( iframeHasValidAttrib )
                {
                    attribsForPlaceHolder[validAttrib] = iframeAttrib;
                }
            }

            return tinymce.util.JSON.serialize(attribsForPlaceHolder).replace(/[{}]/g, '');
        }
    } );

    tinymce.PluginManager.add( 'embed', tinymce.plugins.embed );
})();
