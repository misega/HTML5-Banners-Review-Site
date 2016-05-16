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

    String.prototype.supplant = function(o) {
        return this.replace(/{([^{}]*)}/g,
            function(a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };

    String.prototype.getExtension = function() {
        return this.split('.').pop();
    };

    Number.prototype.pad = function(place) {
        var n = place || 2;
        return ('0000000000' + this).slice(n * -1);
    };

    Date.prototype.formatted = function() {
        var date = new Date(this);
        return (date.getMonth() + 1).pad() + '/' + date.getDate().pad() + '/' + date.getFullYear() + ' @ ' + date.formatTime();
    };

    Date.prototype.formatTime = function() {
        var date = new Date(this);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return hours + ':' + minutes.pad() + ' ' + ampm;
    };

    Date.prototype.toRelativeTime = function(threshold) {
        var delta = new Date() - this,
            now_threshold = parseInt(threshold, 10),
            units = null,
            conversions = {
                millisecond: 1,     // ms    -> ms
                second:     1000,   // ms    -> sec
                minute:     60,     // sec   -> min
                hour:       60,     // min   -> hour
                day:        24,     // hour  -> day
                week:       7,      // day   -> week
                month:      4,      // week  -> month (roughly)
                year:       12      // month -> year
            };

        if (isNaN(now_threshold)) {
            now_threshold = 0;
        }

        if (delta <= now_threshold) {
            return 'Just now';
        }

        for (var key in conversions) {
            if (delta < conversions[key]) {
                break;
            }
            else {
                units = key; // keeps track of the selected key over the iteration
                delta = delta / conversions[key];
            }
        }

        // pluralize a unit when the difference is greater than 1.
        delta = Math.floor(delta);
        if (delta !== 1) { units += 's'; }
        return [delta, units, 'ago'].join(' ');
    };

    app.readable_byte = function(b) {
        var e = Math.log(b) / (10 * Math.LN2) | 0;
        return (Math.round(b / Math.pow(1024, e) * 100) / 100) + ['B', 'KB', 'MB', 'GB', 'TB', 'PB'][e];
    };

    app.param = function(name) {
        var param = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
        return (param) ? param[1] : null;
    };

})(window.app = window.app || {}, jQuery, window, document);
