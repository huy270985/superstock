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

        var $stats = $firebaseObject(ref.child('global_stats'));
        $stats.$loaded()
            .then(function(){
                var data = Object.keys($stats.data).map(function(key) {
                    return {
                        name: key,
                        value: $stats.data[key].value,
                        change: $stats.data[key].change,
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
