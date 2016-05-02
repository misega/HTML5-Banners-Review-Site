/*global files, swfobject, readable_byte */
(function(app, $, window, document, undefined) {
    'use strict';

    /* Cache DOM Elements
    ==================================================================================================== */
    var assetsBanners = 'assets/banners/';
    var $ad_container = $('.ad-container');
    var $file_meta = $('.file-meta span');
    var sizeRegExp = new RegExp('(\\d{2,}x\\d{2,})', 'g');
    var currentBanner;

    /* Banner
    ==================================================================================================== */
    app.banner = (function() {
        var index = null;
        var meta_tpl = '<small><em>FILESIZE:</em></small> <strong>{size}</strong> | <small><em>MODIFIED:</em></small> <strong><abbr data-tooltip="{date-formatted}">{date}</abbr></strong>';

        /* Helper Functions
        --------------------------------------------------------------------------- */
        var isBannerDimensionsEqual = function() {
            return !!(Number($ad_container.width()) === Number(currentBanner.width) && Number($ad_container.height()) === Number(currentBanner.height));
        };

        var cacheBuster = function(img) {
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
                modified: _tab.data('modified')
            };
            // remove existing banner
            $ad_container.children().fadeOut('fast', function() {
                $file_meta.fadeOut(350);

                // if banners are same size, change to new banner
                if (isBannerDimensionsEqual()) {
                    changeBanner();
                }
                // trigger banner container resize; change banner
                else {
                    $ad_container.css({'width': currentBanner.width, 'height': currentBanner.height}).onCSSTransitionEnd(changeBanner);
                }
            });
        }

        function changeBanner() {
            switch (currentBanner.type) {
                case 'iframe': displayIframeBanner(); break;
                default: displayImageBanner(); break;
            }
            displayFileMeta();
            app.$win.trigger('resize');
        }

        function displayIframeBanner() {
            $ad_container.find('iframe').attr({
                'src': currentBanner.file + cacheBuster(currentBanner.file),
                'width': currentBanner.width,
                'height': currentBanner.height
            }).delay(250).fadeIn(350);
        }

        function displayImageBanner() {
            // $ad_container.html($('<img>', {
            //     'src': currentBanner.file + cacheBuster(currentBanner.file),
            //     'width': currentBanner.width,
            //     'height': currentBanner.height
            // }).hide().fadeIn(350));
        }

        function displayFileMeta() {
            $file_meta.html(meta_tpl.supplant({
                'size': app.readable_byte(currentBanner.filesize),
                'date': new Date(currentBanner.modified).toRelativeTime(),
                'date-formatted': new Date(currentBanner.modified).formatted()
            })).hide().fadeIn(350);
        }

        /* Public Functions
        --------------------------------------------------------------------------- */
        return {
            resize: resizeBanner,
            change: changeBanner
        };
    })();

    /* Ad Blocker - Show warning message is blocker is active
    ==================================================================================================== */
    // setTimeout(function() {
    //     var $adbanner = $('.ad-banner');
    //     if ($adbanner.length && !$adbanner.is(':visible')) {
    //         var $div = $('<div>').attr('class', 'warning-banner').html('<h1>Ad block is installed and active.<small>Disable Ad blocking to review these banners.</small></h1>').hide();
    //         $('body').addClass('ad-blocker-active').append($div.fadeIn('slow'));
    //     }
    // }, 500);

    /* Event Triggers
    ==================================================================================================== */
    $('.btn-reload-banner').on('click', function() {
        $ad_container.find('iframe')[0].contentWindow.location.reload(true);
    });

    $(window).on('load', function() {
        var iframeSize = $('.tabs').find(':radio:checked');
        $(iframeSize).trigger('click');
    });

})(window.app = window.app || {}, $, window, document);
