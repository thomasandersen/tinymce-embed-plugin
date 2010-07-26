/**
 * TinyMCE Embed plugin
 *
 * A plugin that let's users paste embeded code such as YouTube videos, Google Maps into the document.
 * NOTE: This plugin requires the TinyMCE Media plugin.
 *
 * Icon: Mark James, http://www.famfamfam.com/lab/icons/silk/ (CC 2.5)
 *
 * TODO: Plugin parameters (iframe content).
 * TODO: Check if it is it possible to extend valid elements from plug-in.
 * TODO: Package.
 */

(function()
{
    tinymce.PluginManager.requireLangPack( 'embed' );

    var imagePlaceHolderPattern = /^(mceItemIframe|mceItemFlash|mceItemShockWave|mceItemWindowsMedia|mceItemQuickTime|mceItemRealMedia)$/;

    tinymce.create( 'tinymce.plugins.embed', {
        init : function( ed, url )
        {
            var t = this;

            function isImagePlaceholder( n )
            {
                return imagePlaceHolderPattern.test(n.className);
            }

            t.url = url;
            t.editor = ed;
            t.embed_iframe_innerhtml_fallback = ( ed.settings.embed_iframe_innerhtml_fallback ) ? ed.settings.embed_iframe_innerhtml_fallback : 'This browser does not support the iframe element.';

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
                cm.setActive( 'embed', isImagePlaceholder( n ) );
            } );

            ed.onSetContent.add( function( ed, o )
            {
                t.iframesToImages( o )
            } );

            ed.onPreProcess.add( function( ed, o )
            {
                if ( o.get )
                {
                    t.imagesToIframes( o );
                }
            } );

            ed.onPostProcess.add( function( ed, o )
            {
                // '$1$3$2$4'
                o.content = o.content.replace(/(<iframe.+?)_iframe_innerhtml="(.+?)"(.+?)(<\/iframe>)/gi, function() {
                    return arguments[1] + arguments[3] + t.editor.dom.decode(arguments[2]) + arguments[4];
                });    
                
            } );
        },


        getInfo : function()
        {
            return {
                longname  : 'Embed',
                author    : 'Thomas Andersen (thomas@mr-andersen.no)',
                authorurl : 'http://www.mr-andersen.no.com',
                infourl   : 'http://www.mr-andersen.no.com',
                version   : "1.0"
            };
        },
     

        imagesToIframes : function( o )
        {
            var t = this, editor = t.editor, dom = editor.dom, iframe;
            var imagePlaceHolders = dom.select( 'img[class="mceItemIframe"]', o.node );

            tinymce.each( imagePlaceHolders, function( img )
            {
                iframe = t.createIframeElement( img );
                dom.replace( iframe, img );
            } );
        },


        iframesToImages: function( o )
        {
            var t = this, editor = t.editor, dom = editor.dom, imagePlaceHolder;
            var iframes = dom.select( 'iframe', o.node );

            tinymce.each( iframes, function( iframe )
            {
                imagePlaceHolder = t.createImagePlaceHolder( iframe, o );

                dom.replace( imagePlaceHolder, iframe );
            } );
        },


        createIframeElement : function( imagePlaceHolder )
        {
            var t = this, editor = t.editor, dom = editor.dom;
            var attribsForIframe = t._parseImagePlaceHolderTitle( imagePlaceHolder );
            var innerHTML = '';

            if ( 'innerhtml' in attribsForIframe )
            {
                innerHTML = attribsForIframe.innerhtml;
                delete attribsForIframe.innerhtml;
            }

            var width = dom.getAttrib( imagePlaceHolder, 'width' );
            var height = dom.getAttrib( imagePlaceHolder, 'height' );

            var iframe = dom.create( 'iframe', attribsForIframe );

            dom.setAttrib( iframe, 'width', width );
            dom.setAttrib( iframe, 'height', height );

            dom.setAttrib( iframe, '_iframe_innerhtml', innerHTML );

            return iframe;
        },


        createImagePlaceHolder : function( iframe, o )
        {
            var t = this, editor = t.editor, dom = editor.dom;
            var image, title, width, height, iframeInnerHTMLAttrib, iframeInnerHTML;

            width = dom.getAttrib( iframe, 'width' );
            height = dom.getAttrib( iframe, 'height' );
            title = t._serializeIframeAttributes( iframe );

            iframeInnerHTMLAttrib = dom.getAttrib(iframe , '_iframe_innerhtml');

            iframeInnerHTML = ( iframeInnerHTMLAttrib !== '' ) ? iframeInnerHTMLAttrib : dom.decode(iframe.innerHTML); // Firefox HTML encodes the iframes innerHTML.

            if (!o.initial)
            {
                iframeInnerHTML = dom.decode(iframeInnerHTML);
            }

            if ( iframeInnerHTML === '' || /^\s*$/.test(iframeInnerHTML) )
            {
                
                iframeInnerHTML = t.embed_iframe_innerhtml_fallback;
            }

            title += ',"innerhtml":"'+tinymce.trim(iframeInnerHTML)+'"';

            image = dom.create( 'img' );

            dom.setAttrib( image, 'src', t.url + '/img/trans.gif' );
            dom.setAttrib( image, 'title', title );
            dom.setAttrib( image, 'width', width );
            dom.setAttrib( image, 'height', height );
            dom.addClass( image, 'mceItemIframe' );

            // For some reason the img.width attribute in IE is not set if the image is not fully loaded.
            dom.setStyle( image, 'width', width );
            dom.setAttrib( image, 'style', 0 );

            return image;
        },


        _parseImagePlaceHolderTitle : function( imagePlaceHolder )
        {
            var t = this, editor = t.editor;
            var shimTitle = editor.dom.getAttrib( imagePlaceHolder, 'title' );

            return tinymce.util.JSON.parse('{' + shimTitle + '}');
        },


        _serializeIframeAttributes : function( iframe )
        {
            var t = this, editor = t.editor, dom = editor.dom, iframeHasValidAttrib, validAttrib, iframeAttrib;
            var xhtml1TransitionalAttribs = ['src', 'width', 'height', 'longdesc', 'name', 'frameborder', 'marginwidth', 'marginheight', 'scrolling', 'align', 'id', 'class', 'style', 'title'];
            var attribsForPlaceHolder = {};

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
