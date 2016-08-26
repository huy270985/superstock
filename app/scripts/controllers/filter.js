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
        // $scope.demoVals = {
        //     sliderExample3: 14
        // }

        // $rootScope.abc = 10000;
        // $rootScope.filters = [];
        // $rootScope.subTerm = [];
        // Ref.child('users/defaultFilter').on('value', function(data){
        //     console.log(data);
        // }, function(err){
        //     console.log(err);
        // });
        $scope.defaultFilter = [{
            "EPS": 1000,
            "maVol30": 30e3,
            "point": 7,
            "profitChange": 20,
            "roe": 7,
            "filterName": "Cơ bản tốt"
        }];
        // var html = '<multiselect ng-model="filter" options="defaultFilter" class="signle-select" selection-limit="1" id-prop="filterName" display-prop="filterName"></multiselect>';
        // $('.default-filter').html($compile(html)($scope));
        // $scope.defaultFilter = [];
        // var defaultFilter = $firebaseArray(Ref.child('users/defaultFilter'));
        // defaultFilter.$loaded(function(data) {
        //     var html = '<multiselect ng-model="filter" options="defaultFilter" class="signle-select" selection-limit="1" id-prop="filterName" display-prop="filterName"></multiselect>';
        //     for (var i = 0; i < data.length; i++) {
        //         var obj = {};
        //         for (var key in data[i]) {
        //             if (key.indexOf('$') < 0) {
        //                 obj[key] = data[i][key];
        //             }
        //         }
        //         obj['filterName'] = data[i].$id;
        //         $scope.defaultFilter.push(obj);
        //     }

        //     $('.default-filter').html($compile(html)($scope));
        // });
        $scope.$watch('filter', function() {
            if ($rootScope.defaultFilter) {
                try {
                    $rootScope.defaultFilter($scope.filter);
                } catch (e) {}
            }
        });

        $scope.$watch('filterEnabled', function() {
            if($rootScope.onOffFilter){
                $rootScope.onOffFilter($scope.filterEnabled);
            }
        })

    });