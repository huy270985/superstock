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
        '$firebaseObject', 'Ref', 'utils', 'currentAuth', 'link', '$q',
        function ($rootScope, $scope, auth, $firebaseArray,
            $firebaseObject, ref, $utils, currentAuth, link, $q) {
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

        function toArray(obj) {
            return Object.keys(obj).map(function(key) {
                return {
                    name: obj[key].id,
                    value: obj[key].value,
                    change: obj[key].change,
                    color: change_color(obj[key].change)
                }
            });
        }

        var $indices = $firebaseObject(ref.child('stats/indices'));
        var $commodities = $firebaseObject(ref.child('stats/commodities'));
        $q.all([$indices.$loaded(), $commodities.$loaded()]).then(function() {
            $rootScope.stats = {
                indices: {
                    data: toArray($indices.data),
                },
                commodities: {
                    data: toArray($commodities.data),
                },
            }
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
