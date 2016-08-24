'use strict';

/**
 * @ngdoc overview
 * @name superstockApp
 * @description
 * # superstockApp
 *
 * Main module of the application.
 */
angular.module('superstockApp', [
        // 'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'firebase',
        'ui.grid',
        'ui.grid.pinning',
        'firebase.auth',
        'firebase.ref',
        'ui.slider',
        'btorfs.multiselect'
    ])
    // .run(function() {
    //     $('.navbar-left').children().click(function() {
    //         $('.navbar-left').children().removeClass('active');
    //         if (window.location.href.split('/')[4] == '') {
    //             $('.navbar-left').children().first().addClass('active')
    //         } else {
    //             $('.navbar-left').children().next().first().addClass('active')
    //         }
    //     })
    // })

$(document).on('click', '.ui-grid-row', function() {
    var thisRow = $(this);
    var classList = thisRow.find('.click-row').length;
    $('.ui-grid-row').find('.ui-grid-cell').removeClass('click-row');
    setTimeout(function() {
        if (classList > 0) {
            thisRow.children().children().removeClass('click-row');
        } else {
            thisRow.children().children().addClass('click-row');
        }
    }, 50)

    $('.view-containner').css('width', '1366px')
    console.log($('.view-containner').css('width'));
})