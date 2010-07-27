var editor;
var embed;

QUnit.config.autostart = false;

test("Insert Google Maps", function() {
    expect(2);

    editor.setContent('<iframe width="640" height="480" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="http://maps.google.com/?ie=UTF8&amp;t=h&amp;ll=63.548552,27.685547&amp;spn=19.042129,56.25&amp;z=4&amp;output=embed"></iframe><br /><small><a href="http://maps.google.com/?ie=UTF8&amp;t=h&amp;ll=63.548552,27.685547&amp;spn=19.042129,56.25&amp;z=4&amp;source=embed" style="color:#0000FF;text-align:left">View Larger Map</a></small>');
    equals(editor.getContent(), '<p><iframe frameborder="0" height="480" marginheight="0" marginwidth="0" scrolling="no" src="http://maps.google.com/?ie=UTF8&amp;t=h&amp;ll=63.548552,27.685547&amp;spn=19.042129,56.25&amp;z=4&amp;output=embed" width="640">This browser does not support the iframe element.</iframe><br /><small><a style="color: #0000ff; text-align: left;" href="http://maps.google.com/?ie=UTF8&amp;t=h&amp;ll=63.548552,27.685547&amp;spn=19.042129,56.25&amp;z=4&amp;source=embed">View Larger Map</a></small></p>');

    editor.setContent('<iframe frameborder="0" height="350" marginheight="0" marginwidth="0" scrolling="no" src="http://maps.google.com/?ie=UTF8&amp;ll=25.085599,-95.712891&amp;spn=80.038802,191.513672&amp;t=h&amp;z=4&amp;output=embed" width="425"><p>Custom innerHTML</p></iframe>');
    equals(editor.getContent(), '<p><iframe frameborder="0" height="350" marginheight="0" marginwidth="0" scrolling="no" src="http://maps.google.com/?ie=UTF8&amp;ll=25.085599,-95.712891&amp;spn=80.038802,191.513672&amp;t=h&amp;z=4&amp;output=embed" width="425"><p>Custom innerHTML</p></iframe></p>');
});

test("Insert Bing Maps", function() {
    expect(2);

    editor.setContent('<div id="mapviewer"><iframe id="map" Name="mapFrame" scrolling="no" width="500" height="400" frameborder="0" src="http://www.bing.com/maps/embed/?lvl=3&amp;cp=57.564380295549434~31.580111503156132&amp;sty=r&amp;draggable=true&amp;v=2&amp;emid=2d014405-e05c-1bdb-cabb-9fbe8a610a3b&amp;w=500&amp;h=400"></iframe></div>');
    equals(editor.getContent(), '<div id="mapviewer"><iframe frameborder="0" height="400" id="map" name="mapFrame" scrolling="no" src="http://www.bing.com/maps/embed/?lvl=3&amp;cp=57.564380295549434~31.580111503156132&amp;sty=r&amp;draggable=true&amp;v=2&amp;emid=2d014405-e05c-1bdb-cabb-9fbe8a610a3b&amp;w=500&amp;h=400" width="500">This browser does not support the iframe element.</iframe></div>');

    editor.setContent('<iframe id="map" Name="mapFrame" scrolling="no" width="500" height="400" frameborder="0" src="http://www.bing.com/maps/embed/?lvl=3&amp;cp=57.564380295549434~31.580111503156132&amp;sty=r&amp;draggable=true&amp;v=2&amp;emid=2d014405-e05c-1bdb-cabb-9fbe8a610a3b&amp;w=500&amp;h=400"><p>Custom innerHTML</p></iframe>');
    equals(editor.getContent(), '<p><iframe frameborder="0" height="400" id="map" name="mapFrame" scrolling="no" src="http://www.bing.com/maps/embed/?lvl=3&amp;cp=57.564380295549434~31.580111503156132&amp;sty=r&amp;draggable=true&amp;v=2&amp;emid=2d014405-e05c-1bdb-cabb-9fbe8a610a3b&amp;w=500&amp;h=400" width="500"><p>Custom innerHTML</p></iframe></p>');
});

test("Insert Google Docs", function() {
    expect(1);

    editor.setContent('<iframe scrolling="no" width="500" height="400" frameborder="0" src="http://spreadsheets.google.com/pub?key=0AuQGDiRNeISsdHk4NlRHX1NaWXU2N01ZYmYxWTc4MWc&hl=en&single=true&gid=0&output=html"><p>Custom innerHTML</p></iframe>');
    equals(editor.getContent(), '<p><iframe frameborder="0" height="400" scrolling="no" src="http://spreadsheets.google.com/pub?key=0AuQGDiRNeISsdHk4NlRHX1NaWXU2N01ZYmYxWTc4MWc&amp;hl=en&amp;single=true&amp;gid=0&amp;output=html" width="500"><p>Custom innerHTML</p></iframe></p>');
});

test("Insert YouTube Player (iframe version)", function() {
    expect(1);

    editor.setContent('<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/EQt54x6KmK8" frameborder="0">\n</iframe>');
    equals(editor.getContent(), '<p><iframe class="youtube-player" frameborder="0" height="385" src="http://www.youtube.com/embed/EQt54x6KmK8" width="640" type="text/html">This browser does not support the iframe element.</iframe></p>');
});

test("Insert YouTube Player", function() {
    expect(1);

    editor.setContent('<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/EQt54x6KmK8&amp;hl=en_US&amp;fs=1"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/EQt54x6KmK8&amp;hl=en_US&amp;fs=1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="640" height="385"></embed></object>');
    equals(editor.getContent(), '<p><object width="640" height="385" data="http://www.youtube.com/v/EQt54x6KmK8&amp;hl=en_US&amp;fs=1" type="application/x-shockwave-flash"><param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="src" value="http://www.youtube.com/v/EQt54x6KmK8&amp;hl=en_US&amp;fs=1" /><param name="allowfullscreen" value="true" /></object></p>');
});

test("Insert Vimeo Player", function() {
    expect(1);

    editor.setContent('<object width="400" height="155"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="http://vimeo.com/moogaloop.swf?clip_id=13616392&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1" /><embed src="http://vimeo.com/moogaloop.swf?clip_id=13616392&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="400" height="155"></embed></object><p><a href="http://vimeo.com/13616392">2 nights in Mallory Square</a> from <a href="http://vimeo.com/philipbloom">Philip Bloom</a> on <a href="http://vimeo.com">Vimeo</a>.</p>');
    equals(editor.getContent(), '<p><object width="400" height="155" data="http://vimeo.com/moogaloop.swf?clip_id=13616392&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1" type="application/x-shockwave-flash"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="src" value="http://vimeo.com/moogaloop.swf?clip_id=13616392&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=0&amp;color=&amp;fullscreen=1" /></object></p><p><a href="http://vimeo.com/13616392">2 nights in Mallory Square</a> from <a href="http://vimeo.com/philipbloom">Philip Bloom</a> on <a href="http://vimeo.com">Vimeo</a>.</p>');
});

test("Iframe output is valid XHTML Transitional", function() {
    expect(1);

    editor.setContent('<iframe invalid-attribute="foo" class="foo-bar" longdesc="This is a Google Spreadsheet" name="g-sh" marginwidth="9" marginheight="0" scrolling="no" align="top" id="g-sh" style="margin:10px ;border:1px solid black" title="Google Docs" width="500" height="400" frameborder="0" src="http://spreadsheets.google.com/pub?key=0AuQGDiRNeISsdHk4NlRHX1NaWXU2N01ZYmYxWTc4MWc&hl=en&single=true&gid=0&output=html" invalid-attribute2="bar">Custom innerHTML</iframe>');
    equals(editor.getContent(), '<p><iframe align="top" class="foo-bar" frameborder="0" height="400" id="g-sh" longdesc="This is a Google Spreadsheet" marginheight="0" marginwidth="9" name="g-sh" scrolling="no" src="http://spreadsheets.google.com/pub?key=0AuQGDiRNeISsdHk4NlRHX1NaWXU2N01ZYmYxWTc4MWc&amp;hl=en&amp;single=true&amp;gid=0&amp;output=html" style="margin: 10px; border: 1px solid black;" title="Google Docs" width="500">Custom innerHTML</iframe></p>');
});



