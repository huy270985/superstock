'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FilterCtrl
 * @description
 * # FilterCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FilterCtrl', function($rootScope, $scope) {
        $scope.demoVals = {
            sliderExample3: 14
        }

        $rootScope.abc = 10000;
        $rootScope.filters = [];
        $rootScope.subTerm = [];
        // $rootScope.changeFilter = function(index) {
        //     console.log(index);
        // }
        $scope.options = [
            "France",
            "United Kingdom",
            "Germany",
            "Belgium",
            "Netherlands",
            "Spain",
            "Italy",
            "Poland",
            "Austria"
        ]
    });