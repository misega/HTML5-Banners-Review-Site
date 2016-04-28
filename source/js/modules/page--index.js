/* global subscribe */
(function(app, $, window, document, undefined) {
    'use strict';

    /* Cache Elements
    --------------------------------------------------------------------------- */
    var docElem = window.document.documentElement;
    var docscroll = 0;

    var $showMenu = $('.show-menu');
    var $perspectiveWrapper = $('.perspective');
    var $container = $perspectiveWrapper.find('.container');
    var $contentWrapper = $container.find('.content-wrapper');

    var tabsWidth = 0;
    var $tabsContainer = $('.tabs');
    var $tabs = $tabsContainer.find('.tab');
    var $singleTab = $tabsContainer.find('.single-tab');
    var $mobileNavigation = $('nav.navigation');

    /* Utils
    --------------------------------------------------------------------------- */
    function scrollY() {
        return window.pageYOffset || docElem.scrollTop;
    }

    /* Show Off-Canvas Menu
    --------------------------------------------------------------------------- */
    $showMenu.on('click', function() {
        if ($('body').hasClass('animate')) { return; }

        docscroll = scrollY();
        // change top of contentWrapper
        $contentWrapper.css('top', docscroll * -1 + 'px');
        // mac chrome issue:
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        $perspectiveWrapper.addClass('modalview');
        setTimeout(function() { $('body').addClass('animate'); }, 25);
    });

    $container.on('click', function() {
        if (!$('body').hasClass('animate')) { return; }

        $container.onCSSTransitionEnd(function() {
            if ($('body').hasClass('animate')) { return; }
            $perspectiveWrapper.removeClass('modalview');
            // mac chrome issue:
            document.body.scrollTop = document.documentElement.scrollTop = docscroll;
            // change top of contentWrapper
            $contentWrapper.css('top', 0);
        });
        $('body').removeClass('animate');
    });

    subscribe('resize/start', function() {
        if ($('body').is('.animate')) {
            $showMenu.trigger('click');
        }
    });

    /* Event Listener: Toggle Off-Canvas Menu Button
    --------------------------------------------------------------------------- */
    var $tabsClone = [];
    $tabs.each(function(i, tab) {
        var isChecked = $(tab).find('input:radio').is(':checked');
        var active = (isChecked)? ' class="active"' : '';
        var a = '<a href="#"' + active + '>' + tab.textContent + '</a>';
        $tabsClone.push(a);
    });
    $mobileNavigation.html($tabsClone.join('')).on('click', 'a', function(e) {
        e.preventDefault();
        $singleTab.find('span').text(this.textContent);
        $mobileNavigation.find('a').filter('.active').removeClass('active').end().filter(this).addClass('active');

        var evt = (e.originalEvent)? 'real' : 'simulated';
        if (evt === 'real') {
            var idx = $(e.currentTarget).index();
            $tabs.eq(idx).trigger('click');
        }
    });

    /* Get max width of all tabs; hide main tabs, if container is narrower
    --------------------------------------------------------------------------- */
    $tabs.each(function(i, tab) {
        tabsWidth += $(tab).outerWidth() + 4;
    });

    $(window).on('resize', function() {
        if ($tabsContainer.width() <= tabsWidth) {
            $tabs.hide();
            $singleTab.css('display', 'inline-block');
        }
        else {
            $tabs.css('display', 'inline-block');
            $singleTab.hide();
        }
    }).trigger('resize');

    /* Trigger first tab
    --------------------------------------------------------------------------- */
    $tabs.find('input:radio').on('click', function() {
        var _tab = this;
        _tab.idx = $(this).parent().index();
        //banner.resize.call(_tab);
        $mobileNavigation.find('a').eq(_tab.idx).trigger('click');
    }).first().trigger('click');

    var $banner = $('.banner');
    var $bannerContent = $banner.find('iframe.banner-content');
    var $btnZoom = $('.js-btn-zoom');
    app.$win.on('resize', function() {
        var hasOverflow = $banner.get(0).scrollWidth > $banner.width();
        $btnZoom[(hasOverflow)? 'addClass' : 'removeClass']('active');
    }).trigger('resize');
    $btnZoom.on('click', function() {
        window.open($bannerContent.attr('src'), '_blank');
    });

})(window.app = window.app || {}, $, window, document);
