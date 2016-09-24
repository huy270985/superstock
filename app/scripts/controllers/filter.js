'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FilterCtrl
 * @description
 * # FilterCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FilterCtrl', function($rootScope, $scope, Ref, $firebaseArray, $compile) {
        $scope.defaultFilter = [{
            "EPS": 1000,
            "maVol30": 30e3,
            "point": 7,
            "profitChange": 20,
            "roe": 7,
            "filterName": "Cơ bản tốt"
        }];

        $rootScope.$watch('searchTerm', function() {
            if ($rootScope.search)
                $rootScope.search($rootScope.searchTerm)
        })

        $scope.$watch('filter', function() {
            if ($scope.filter && $scope.filter.length == 0) {
                $scope.filter = null;
                return;
            }
            if ($rootScope.defaultFilter) {
                try {
                    $rootScope.defaultFilter($scope.filter);
                } catch (e) {}
            }
        });

        $scope.$watch('filterEnabled', function() {
            if ($rootScope.onOffFilter) {
                $rootScope.onOffFilter($scope.filterEnabled);
            }
        })

    });