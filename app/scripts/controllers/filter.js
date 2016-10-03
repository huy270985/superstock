'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FilterCtrl
 * @description
 * # FilterCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FilterCtrl', function ($rootScope, $scope, Ref, $firebaseArray, $compile) {
        $scope.defaultFilter = [{
            "EPS": 1000,
            "maVol30": 30e3,
            "point": 7,
            "profitChange": 20,
            "roe": 7,
            "filterName": "Cơ bản tốt"
        }];
        $scope.individualFilter = false;
        $scope.publicFilter = true;

        /**
         * Filter by search (by CP)
         */
        $rootScope.$watch('searchTerm', function () {
            if ($rootScope.search)
                $rootScope.search($rootScope.searchTerm)
        })

        $scope.filterChange = function () {
            if ($scope.filter && $scope.filter.length == 0) {
                $scope.filter = null;
            }
            $rootScope.filterData = $scope.filter;
            if ($rootScope.filterModes)
                $rootScope.filterModes();
        }

        /**
         * Filter mode Public or Individual
         */
        $scope.$watch('filterModes', function () {
            if ($rootScope.filterModes) {
                if ($scope.filterModes) {
                    // For individual filter
                    $scope.publicFilter = false;
                    $scope.individualFilter = true;
                    $rootScope.filterModes(true);
                } else {
                    // For public filter
                    $scope.publicFilter = true;
                    $scope.individualFilter = false;
                    $rootScope.filterModes(false);
                }
            }
        });

        /**
         * Reset filter mode
         */
        $rootScope.resetFilterModes = function () {
            $scope.filterModes = false;
            $scope.publicFilter = true;
            $scope.individualFilter = false;
        }

        /**
         * Hide filter controls when click outsite
         */
        $scope.filterHide = function () {

        }
        $(document).on('click', '#container-fluit-area, #footer-area, #header-area', function () {
            if (!$("#sidebar-wrapper").parent().hasClass("toggled")) {
                $("#filter-control").removeClass('ng-hide');
                $("#wrapper").toggleClass("toggled");
                $scope.$apply(function () {
                    // $rootScope.filterOn = false;
                    // $rootScope.resetFilterModes();
                    // $rootScope.resetFilter();
                })
            }
        });

        /**
         * Set data for default filter
         */
        $rootScope.setDataForDefaultFilter = function () {
            // $scope.filter = $scope.defaultFilter;
        }
    });