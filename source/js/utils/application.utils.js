(function(app, $, window, document, undefined) {
    'use strict';

    /* Cache Primary DOM elements
    --------------------------------------------------------------------------- */
    app.$win = $(window);
    app.$doc = $(document);
    app.$html = $('html');
    app.$head = $('head');
    app.$body = $('body');
    app.$container = $('.container');
    app.$header = $('global-header');
    app.$main = $('.main');
    app.$footer = $('.global-footer');

    app.isModernBrowser = !!('querySelector' in document && 'localStorage' in window && 'addEventListener' in window);
    app.touchOrClick = ('ontouchend' in window)? 'touchend' : 'click';

    /* Current assets path
    --------------------------------------------------------------------------- */
    var script = $('script').last().get(0);
    app.path = script.src.substr(0, script.src.lastIndexOf('/') - 2); // -2: remove 'js' from path

})(window.app = window.app || {}, jQuery, window, document);
