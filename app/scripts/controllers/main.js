'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', ['$rootScope', '$scope', '$q', 'auth', '$firebaseArray',
        '$firebaseObject', 'Ref', 'draw', 'uiGridConstants', '$sce', 'utils', 'currentAuth', '$window', '$compile', '$filter', '$timeout',
        'tableSettings', '$tableRepository', '$gridSettings', '$table',
        function ($rootScope, $scope, $q, auth, $firebaseArray,
            $firebaseObject, Ref, draw, uiGridConstants, $sce, utils, currentAuth, $window, $compile, $filter, $timeout,
            tableSettings, $tableRepository, $gridSettings, $table) {
            $rootScope.link = tableSettings.name;
            $window.ga('send', 'pageview', "Tổng hợp");
            var uid = auth.$getAuth().uid;

            /*
            * Get market summary data
            */
            utils.getMarketSummary().then(function (data) {
                $scope.headerTitle = data;
            }).catch(function (ex) {
                console.error('Exception when getMarketSummary')
            });

            /*
            * Update trading date
            */
            utils.getTradingDate().then(function (data) {
                $scope.tradingDate = data;
            }).catch(function (ex) {
                console.error('Exception when getTradingDate')
            });

            function provideData(config, handlers) {
                draw.drawGrid(
                    $rootScope.user.account.active,
                    Ref.child(tableSettings.gridDataSource),
                    config,
                    handlers.loading,
                    handlers.loaded,
                    handlers.changes,
                );
            }

            $table.create($rootScope, $scope, tableSettings, uid, provideData);

            /**
             * Binding onclick event for symbol, display company profile & technical chart
             */
            $(document).ready(function () {
                /*
                * Graph chart click event
                */
                $(document).on('click', '.chart-icon', function () {
                    $('#myModal').modal('show');
                    $scope.stockInfo = $(this).data('symbol');
                    $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + $(this).data('symbol');
                    $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
                });

                /*
                * Company information click event
                */
                $(document).on('click', '.information-icon', function () {
                    $('#companyModal').modal('show');
                    var symbolVal = $(this).data('symbol');
                    var industryVal = $(this).data('industry');
                    $scope.companyInfo = symbolVal;
                    utils.getCompanyInformation(symbolVal).then(function (data) {
                        $scope.companyDatas = data;
                    }).catch(function (ex) {
                        console.error('Could not load company info', ex);
                    });
                });
            });


        }]);