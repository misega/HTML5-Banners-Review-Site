/* global publish, subscribe */
(function(app, $, window, document, undefined) {
    'use strict';

    var DELAY = 250;
    app.MOBILE_SWITCH_WIDTH = 900;
    app.win_width = app.$win.width();

    app.isDesktop = function() {
        return app.$win.width() > app.MOBILE_SWITCH_WIDTH;
    };


    /* Global Event Listeners / Triggers
    --------------------------------------------------------------------------- */
    app.$win.resize($.debounce(DELAY, true,
        function() {
            if (app.$win.width() !== app.win_width) {
                publish('resize/start');
            }
            app.win_width = app.$win.width();
        }
    ));

    app.$win.resize($.debounce(DELAY,
        function() {
            publish('resize/end');
        }
    ));

    app.$win.scroll($.debounce(DELAY, true,
        function() {
            publish('scroll/start');
        }
    ));

    app.$win.scroll($.debounce(DELAY,
        function() {
            publish('scroll/end');
        }
    ));

    $(window).load(function() {
        setTimeout(function() {
            publish('window/load');
        }, 250);
    });

    publish('page/load');

})(window.app = window.app || {}, $, window, document);
