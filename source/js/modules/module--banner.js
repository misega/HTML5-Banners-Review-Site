/*global files, swfobject, readable_byte */
(function(app, $, window, document, undefined) {
    'use strict';

    /* Cache DOM Elements
    ==================================================================================================== */
    var assetsBanners = 'banners/';
    var $ad_container = $('.ad-container');
    var $file_meta = $('.file-meta span');
    var sizeRegExp = new RegExp('(\\d{2,}x\\d{2,})', 'g');
    var currentBanner;

    /* Banner
    ==================================================================================================== */
    app.banner = (function() {
        var index = null;
        var meta_tpl = [
            '<small><em>FILESIZE:</em></small> ',
            '<strong>{size}</strong> | ',
            '<small><em>MODIFIED:</em></small> ',
            '<strong><abbr data-tooltip="{date-formatted}">{date}</abbr></strong>',
            '<br><a href="{zipfile}" class="btn-download"><strong>Download Banner</strong></a>'
        ].join('');

        /* Helper Functions
        --------------------------------------------------------------------------- */
        var isBannerDimensionsEqual = function() {
            return !!(Number($ad_container.width()) === Number(currentBanner.width) && Number($ad_container.height()) === Number(currentBanner.height));
        };

        var cacheBuster = function() {
            return '?cache=' + Date.now();
        };

        /* Internal Functions
        --------------------------------------------------------------------------- */
        function resizeBanner() {
            var _tab = this;
            var idx = _tab.idx;
            var dimensions = _tab.text().match(sizeRegExp)[0].split('x');
            currentBanner = {
                file: assetsBanners + _tab.text(),
                type: _tab.data('type'),
                width: dimensions[0],
                height: dimensions[1],
                filesize: _tab.data('filesize'),
                modified: _tab.data('modified'),
                zipfile: _tab.data('zipfile')
            };
            // remove existing banner
            $ad_container.find('iframe').attr('src', 'about:blank');

            setTimeout(function() {
                $file_meta.fadeOut(100);
                changeBanner();
            }, 100);
        }

        function changeBanner() {
            displayIframeBanner();
            displayFileMeta();
            app.$win.trigger('resize');
        }

        function displayIframeBanner() {
            $ad_container.css({
                'width': currentBanner.width,
                'height': currentBanner.height
            }).find('iframe').attr({
                'src': currentBanner.file + '/index.html' + cacheBuster(currentBanner.file)
            });
        }

        function displayFileMeta() {
            $file_meta.html(meta_tpl.supplant({
                'size': currentBanner.filesize,
                'date': new Date(currentBanner.modified).toRelativeTime(),
                'date-formatted': new Date(currentBanner.modified).formatted(),
                'zipfile': currentBanner.zipfile
            })).hide().fadeIn(350);
            if (!/{{\w+}}/.test(currentBanner.zipfile)) { $file_meta.find('.btn-download').css('display', 'inline-block'); }
        }

        /* Public Functions
        --------------------------------------------------------------------------- */
        return {
            resize: resizeBanner,
            change: changeBanner
        };
    })();

    /* Event Triggers
    ==================================================================================================== */
    $('.btn-reload-banner').on('click', function() {
        $ad_container.find('iframe')[0].contentWindow.location.reload(true);
    });

    $(window).on('load', function() {
        var $tabs = $('.tabs');
        var paramTab = parseInt(app.param('tab'), 10) - 1 || 0; // adjust for zero-based index
        var activeTab = Math.max(0, Math.min(paramTab, $tabs.children('.tab').length - 1)); // clamp between values
        $tabs.find(':radio').prop('checked', false).eq(activeTab).prop('checked', true);

        var iframeSize = $tabs.find(':radio:checked');
        $(iframeSize).trigger('click');

        if (window.location.hash.slice(1) === 'controls') {
            $('.btn-reload-banner').hide();
            $.getScript('assets/_banner-support-files/controls/_banners.js');
        }
    });

})(window.app = window.app || {}, $, window, document);
