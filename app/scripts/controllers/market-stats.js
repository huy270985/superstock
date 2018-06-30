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
        '$firebaseObject', 'Ref', 'utils', 'currentAuth', 'link',
        function ($rootScope, $scope, auth, $firebaseArray,
            $firebaseObject, ref, $utils, currentAuth, link) {
        // so tab can highlight correctly
        $rootScope.link = link;

        function change_color(value) {
            if (+value > 0) {
                return '#1ee908';
            }
            if (+value == 0) {
                return '#fc0';
            }
            if (+value < 0) {
                return '#fb0000';
            }
        }

        var $stats = $firebaseObject(ref.child('global_stats'));
        $stats.$loaded()
            .then(function(){
                var data = Object.keys($stats.data).map(function(key) {
                    return {
                        name: key,
                        value: $stats.data[key].value,
                        change: $stats.data[key].change,
                        color: change_color($stats.data[key].change_value)
                    }
                });
                $rootScope.stats = {
                    data: data,
                    lastUpdated: $stats.lastUpdated,
                };
            })
            .catch(function(error) {
                var message = 'Không lấy được thống kê thị trường, xin thử lại.'
                console.error(message, error);
                $rootScope.system = {
                    message: message,
                    error: error
                }
                $('#sysModal').modal('show')
            });

    }]);
