'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:PersonalPortfolioCtrl
 * @description
 * #PersonalPortfolioCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MarketStatsCtrl', ['$rootScope', '$scope', 'auth', '$firebaseArray',
        '$firebaseObject','utils', 'currentAuth', 'link',
        function ($rootScope, $scope, auth, $firebaseArray,
            $firebaseObject, $utils, currentAuth, link) {
          $rootScope.link = link;
        }]);
