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
            $window.ga('send', 'pageview', "recomendation");
            var uid = auth.$getAuth().uid;

            common.syncMarketSummary($scope);
            common.syncTradingDate($scope);
            common.clickSymbolPopupDetails($scope);

            const table = $table.create($rootScope, $scope, tableSettings, uid, {
                onGridReady: function () {
                    var colSettings = sellDataProvider.colSettings();
                    table.setColSettings(colSettings);
                    $scope.personalStocks = "VND,SSI";
                    $scope.filterPersonalStocks();
                },

                onCellValueChanged: function (event) {
                    console.log("onCellValueChanged", event);
                },

            });

            $scope.filterPersonalStocks = function () {
                var symbols = $scope.personalStocks.split(",");
                sellDataProvider.watch({
                    'changed': function (key, data) {
                        console.log("update row", key, data)
                        table.changed(key, data)
                    },
                    'removed': function (key) {
                        table.removed(key);
                    }
                }, symbols);

                table.changed('XXX', {})
            }

        }]);