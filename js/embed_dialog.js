var g_editor;
var g_textarea, g_previewContainer;
var g_update = false;

var pathToCodeMirror = '../../../../examples/CodeMirror-0.8/';

function init()
{
    tinyMCEPopup.restoreSelection();

    tinyMCEPopup.resizeToInnerSize();

    g_editor = tinyMCEPopup.editor;
    g_textarea = document.getElementById('source');
    g_previewContainer = document.getElementById('preview');

    var selectedNode = g_editor.selection.getNode();
    var htmlFragment, iframeInnerHTML;

    var isPlaceholderElem = /^(mceItemIframe|mceItemFlash|mceItemShockWave|mceItemWindowsMedia|mceItemQuickTime|mceItemRealMedia)$/.test(selectedNode.className);

    if ( !isPlaceholderElem )
    {
        return;
    }

    if ( isPlaceholderElem )
    {
        g_update = true;

        document.getElementById('insert').value = g_editor.getLang('embed.btn_update');        
    }

    htmlFragment = transformPlaceholderElem( selectedNode );

    iframeInnerHTML = g_editor.dom.getAttrib(htmlFragment, '_iframe_innerhtml');
    iframeInnerHTML = g_editor.dom.decode(iframeInnerHTML);

    g_editor.dom.setAttrib(htmlFragment, '_iframe_innerhtml', '');

    htmlFragment = g_editor.serializer.serialize(htmlFragment);

    htmlFragment = htmlFragment.replace(/(<iframe\s.+?>)(|.+?)(<\/iframe>)/gi, '$1'+iframeInnerHTML+'$3');

    g_textarea.value = htmlFragment;

    /*
    var codemirror = CodeMirror.fromTextArea('source', {
        parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "parsehtmlmixed.js"],
        stylesheet: ["" + pathToCodeMirror + "css/xmlcolors.css", ""+pathToCodeMirror+"css/jscolors.css", ""+pathToCodeMirror+"css/csscolors.css"],
        path: pathToCodeMirror + "js/",
        tabMode: "indent",
        reindentOnLoad: true
    });
    */


    // Set time out since it seems Safari not always will update the preview on init.
    setTimeout(function() {
        updatePreview();
    }, 30);

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
    var previewIframe = g_previewContainer;

    if (isSourceValid())
    {
        previewIframe = (previewIframe.contentWindow) ? previewIframe.contentWindow : (previewIframe.contentDocument.document) ? previewIframe.contentDocument.document : previewIframe.contentDocument;
        previewIframe.document.open();
        previewIframe.document.write(g_textarea.value);
        previewIframe.document.close();
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