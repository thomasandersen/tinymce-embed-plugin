var g_editor;
var g_textarea, g_previewContainer;
var g_update = false;

function init()
{
    tinyMCEPopup.restoreSelection();

    tinyMCEPopup.resizeToInnerSize();

    g_editor = tinyMCEPopup.editor;
    g_textarea = document.getElementById('source');
    g_previewContainer = document.getElementById('preview');

    var selectedNode = g_editor.selection.getNode();
    var html;

    var isPlaceholderElem = /^(mceItemIframe|mceItemFlash|mceItemShockWave|mceItemWindowsMedia|mceItemQuickTime|mceItemRealMedia)$/.test(selectedNode.className);

    if ( !isPlaceholderElem )
    {
        return;
    }

    if ( isPlaceholderElem )
    {
        g_update = true;
    }

    html = transformPlaceholderElem( selectedNode );

    g_textarea.value = g_editor.serializer.serialize(html);

    updatePreview();
}

function insertSource()
{
    var source = g_textarea.value;

    if ( window.tinyMCE )
    {
        if ( isSourceValid() )
        {
            if ( g_update )
            {
                tinyMCEPopup.restoreSelection();

                var dom = g_editor.dom;
                var selection = g_editor.selection;
                var bogus = g_editor.getDoc().createElement( 'br' );
                bogus.id = '___temp1';

                dom.replace( bogus, selection.getNode() );

                selection.select( bogus );
            }

            tinyMCE.execCommand('mceInsertRawHTML',false, source);

            tinyMCEPopup.editor.execCommand( 'mceRepaint' );
            tinyMCEPopup.close();
        }
        else
        {
            showError();
        }
    }
    return true;
}

function updatePreview()
{
    if ( isSourceValid() )
    {
        g_previewContainer.innerHTML = g_textarea.value;
    }
    else
    {
        showError();
    }
}

function transformPlaceholderElem( node )
{
    if ( node.className == 'mceItemIframe' )
    {
        return tinyMCEPopup.editor.plugins.embed.createIframeElement( node );
    }

    var ci, cb, mt;

    var media = tinyMCEPopup.editor.plugins.media;

    switch ( node.className )
    {
        case 'mceItemFlash':
            ci = 'd27cdb6e-ae6d-11cf-96b8-444553540000';
            cb = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0';
            mt = 'application/x-shockwave-flash';
            break;

        case 'mceItemShockWave':
            ci = '166b1bca-3f9c-11cf-8075-444553540000';
            cb = 'http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0';
            mt = 'application/x-director';
            break;

        case 'mceItemWindowsMedia':
            ci = ed.getParam( 'media_wmp6_compatible' ) ? '05589fa1-c356-11ce-bf01-00aa0055595a' : '6bf52a52-394a-11d3-b153-00c04f79faa6';
            cb = 'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701';
            mt = 'application/x-mplayer2';
            break;

        case 'mceItemQuickTime':
            ci = '02bf25d5-8c17-4b23-bc80-d3488abddc6b';
            cb = 'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0';
            mt = 'video/quicktime';
            break;

        case 'mceItemRealMedia':
            ci = 'cfcdaa03-8be4-11cf-b84b-0020afbbccfa';
            cb = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0';
            mt = 'audio/x-pn-realaudio-plugin';
            break;
    }

    if ( ci )
    {
        return media._buildObj( { classid : ci, codebase : cb, type : mt }, node );
    }

    return '';
}

function showError()
{
    alert('Source contains script. Please remove');
}

function isSourceValid()
{
    var valid = true;
    var source = g_textarea.value;

    if ( source.indexOf( '<script' ) > -1 )
    {
        valid = false;
    }

    return valid;
}