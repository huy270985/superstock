'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:RecommendationCtrl
 * @description
 * # RecommendationCtrl
 * Controller of the superstockApp
 * Cột
 *      Mã cp / khối lượng/ giá vốn/ % phân bổ/ % lãi lỗ/ bán cắt lỗ/bán chặn lãi/giảm liên tục/gãy xu hướng
 */
angular.module('superstockApp')
    .controller('RecommendationCtrl', ['$rootScope', '$scope', 'auth',
        'Ref', 'sellDataProvider', '$window',
        'tableSettings', '$tableRepository', '$table', 'common',
        function ($rootScope, $scope, auth,
            Ref, sellDataProvider, $window,
            tableSettings, $tableRepository, $table, common) {
            $rootScope.link = tableSettings.name;
            $window.ga('send', 'pageview', "Tổng hợp");
            var uid = auth.$getAuth().uid;

            common.syncMarketSummary($scope);
            common.syncTradingDate($scope);
            common.clickSymbolPopupDetails($scope);

            const table = $table.create($rootScope, $scope, tableSettings, uid);
            setTimeout(function () {
                var colSettings = sellDataProvider.colSettings();
                table.setColSettings(colSettings);
                sellDataProvider.load({
                    'changed': function (key, data) {
                        table.changed(key, data);
                    }
                })
            // why we need a timeout? Because ag-grid is not ready right way.
            // there is a gridReady event to know when the grid finishes initilization
            // but I don't know how to yet
            }, 200);

        }]);