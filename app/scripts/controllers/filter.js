'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FilterCtrl
 * @description
 * # FilterCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FilterCtrl', ['$rootScope', '$scope', 'Ref', '$firebaseArray', '$compile',
        function ($rootScope, $scope, Ref, $firebaseArray, $compile) {
            $scope.defaultFilter = [{
                "id": 1,
                "EPS": 1000,
                "maVol30": 30e3,
                "point": 7,
                "profitChange": 20,
                "roe": 7,
                "filterName": "Cơ bản tốt"
            }];
            $scope.individualFilter = false;
            $scope.publicFilter = true;
            $scope.filterModes;

            /**
             * Filter by search (by CP)
             */
            $rootScope.$watch('searchTerm', function () {
                if ($rootScope.search)
                    $rootScope.search($rootScope.searchTerm)
            })

            /**
             * Public filter change
             */
            $scope.filterChange = function () {
                if ($scope.filter && $scope.filter.length == 0) {
                    $scope.filter = null;
                }
                $rootScope.filterData = $scope.filter;
                if ($rootScope.filterModes)
                    $rootScope.filterModes();

                $rootScope.saveFilterSetting();
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

                    $rootScope.saveFilterSetting();
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

            /**
             * Save filter setting
             */
            $rootScope.saveFilterSetting = function () {
                var filter = {};
                if ($rootScope.userFilter) {
                    filter = $rootScope.userFilter;
                    if (!filter.filterMode && !filter.publicFilter && !filter.individualFilter)
                        filter = {};
                }
                // FIlter mode
                filter.filterMode = $scope.filterModes;

                // Public filter
                var publicFilter = [];
                if ($scope.filter && $scope.filter != null) {
                    for (var i in $scope.filter) {
                        publicFilter.push($scope.filter[i].id);
                    }
                }

                if (publicFilter)
                    filter.publicFilter = publicFilter;

                // Individual filter
                var individualFilter = filterConvert($rootScope.filterList, null);
                if (individualFilter && Object.keys($rootScope.filterList).length > 0)
                    filter.individualFilter = individualFilter;

                var user = Ref.child('users/' + $rootScope.user.uid);
                user.child('filter').set(filter, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Saved filter setting');
                    }
                });
            }

            /**
             * Set filter by user setting
             */
            $rootScope.setFilterSetting = function () {
                if ($rootScope.userFilter && $rootScope.userFilter.filterMode != undefined) {
                    $scope.filterModes = $rootScope.userFilter.filterMode;
                    if ($rootScope.userFilter.publicFilter) {
                        var filters = [];
                        for (var i in $rootScope.userFilter.publicFilter) {
                            var id = $rootScope.userFilter.publicFilter[i];
                            var filter = $scope.defaultFilter.filter(function (value) {
                                return id == value.id;
                            });
                            if (filter && filter[0])
                                filters.push(filter[0]);
                        }
                        if (filters && filters.length > 0)
                            $scope.filter = filters;
                    }
                    // if (!$scope.filterModes) {
                    //     $scope.filterChange();
                    // }
                }
            }
        }]);