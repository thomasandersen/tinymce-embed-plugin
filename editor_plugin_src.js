/**
 * TinyMCE Embed plugin
 *
 * A plugin that let's users paste embeded code such as YouTube videos, Google Maps into the document.
 * NOTE: This plugin requires the TinyMCE Media plugin.
 *
 * Icon: Mark James, http://www.famfamfam.com/lab/icons/silk/ (CC 2.5)
 *
 * TODO: If an Iframe is 100%, IE will not render the width correct (only when opening the content for editing).
 * TODO: Try to avoid replacing iframe element contents.
 * TODO: Plugin parameters (iframe content).
 * TODO: Package.
 */

(function()
{
    tinymce.PluginManager.requireLangPack( 'embed' );

    tinymce.create( 'tinymce.plugins.embed', {
        init : function( ed, url )
        {
            var t = this;

            function isNodePlaceholder( n )
            {
                return t.imagePlaceholderPattern.test(n.className);
            }

            t.url = url;
            t.editor = ed;
            t.iframeContent = 'Default content';
            t.iframePattern = /(<iframe\s.+?>)(|.+?)(<\/iframe>)/gi;
            t.iframeReplacePattern = '$1'+t.getIframeContent()+'$3';
            t.imagePlaceholderPattern = /^(mceItemIframe|mceItemFlash|mceItemShockWave|mceItemWindowsMedia|mceItemQuickTime|mceItemRealMedia)$/;

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
                cm.setActive( 'embed', isNodePlaceholder( n ) );
            } );

            ed.onGetContent.add(function(ed, o)
            {
                o.content = t.addContentToIframes( o.content );
            });

            ed.onSaveContent.add( function( ed, o )
            {
                o.content = t.addContentToIframes( o.content );
            });

            ed.onSetContent.add( function( ed, o )
            {
                t.iframesToImages( o )
            } );

            ed.onPreProcess.add( function( ed, o )
            {
                if ( o.get )
                {
                    t.imagesToIframes( o )
                }
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
                imagePlaceHolder = t.createImagePlaceHolder( iframe );

                dom.replace( imagePlaceHolder, iframe );
            } );
        },

        createIframeElement : function( imagePlaceHolder )
        {
            var t = this, editor = t.editor, dom = editor.dom;
            var attribsForIframe = t._parseImagePlaceHolderTitle( imagePlaceHolder );
            var iframeContent = '';

            if ( 'content' in attribsForIframe )
            {
                iframeContent = attribsForIframe.content;
                t.setIframeContent(iframeContent);
                delete attribsForIframe.content; 
            }

            var width = dom.getAttrib( imagePlaceHolder, 'width' );
            var height = dom.getAttrib( imagePlaceHolder, 'height' );

            var iframe = dom.create( 'iframe', attribsForIframe );

            dom.setAttrib( iframe, 'width', width );
            dom.setAttrib( iframe, 'height', height );

            return iframe;
        },

        createImagePlaceHolder : function( iframe )
        {
            var t = this, editor = t.editor, dom = editor.dom;
            var image, title, width, height;

            width = dom.getAttrib( iframe, 'width' );
            height = dom.getAttrib( iframe, 'height' );
            title = t._serializeIframeAttributes( iframe );

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

        addContentToIframes : function( content )
        {
            var t = this;
            return content.replace( t.iframePattern, t.iframeReplacePattern );
        },

        setIframeContent : function( content )
        {
            var t = this;
            if ( content !== '' ) t.iframeContent = content;
        },

        getIframeContent : function( content )
        {
            var t = this;
            return t.iframeContent;
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

            // Set content for Iframe
            // <iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://maps.google.com/?ie=UTF8&amp;t=h&amp;ll=37.0625,-95.677068&amp;spn=24.455808,37.353516&amp;z=4&amp;output=embed"><p>Hello, from Iframe</p></iframe>

            attribsForPlaceHolder['content'] = t.getIframeContent();
            t.setIframeContent(attribsForPlaceHolder.content);
            alert(t.getIframeContent());


            return tinymce.util.JSON.serialize(attribsForPlaceHolder).replace(/[{}]/g, '');
        }
    } );

    tinymce.PluginManager.add( 'embed', tinymce.plugins.embed );
})();
