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

            function updateRecord(data) {
                data.cutLoss = data.costPrice * 0.96;
                data.pnl = (data.close - data.costPrice) / data.costPrice * 100;
            }

            const table = $table.create($rootScope, $scope, tableSettings, uid, {
                onGridReady: function () {
                    var colSettings = sellDataProvider.colSettings();
                    table.setColSettings(colSettings);
                    $scope.personalStocks = "VND,SSI";
                    $scope.newRow();
                },

                onCellValueChanged: function (event) {
                    console.log("onCellValueChanged", event);
                    var data = event.data;

                    if (event.colDef.field == "symbol") {
                        var newSymbol = event.newValue;
                        var oldSymbol = event.oldValue;
                        // subscribe
                        sellDataProvider.unsubscribe(oldSymbol);
                        sellDataProvider.subscribe({
                            changed: function (_, newData) {
                                // id of the row is independent from symbol now
                                newData.id = data.id;
                                newData.quantity = +data.quantity || 0;
                                newData.costPrice = +data.costPrice || 0;
                                updateRecord(newData);
                                table.changed(newData.id, newData);
                            }
                        }, newSymbol)
                    }

                    if (event.colDef.field == "costPrice") {
                        var data = event.data;
                        updateRecord(data);
                        table.changed(data.id, data);
                    }
                },

            });

            $scope.newRow = function () {
                var id = table.added(Date.now(), {})
            }

            $scope.deleteRecord = function (data, rowIndex) {
                console.debug("deleteRecord", data, rowIndex);
                table.removed(data.id);
                // $scope.gridMainOptions.api.rowData.splice(selected.rowIndex, 1);
                // $scope.gridMainOptions.api.setRowData($scope.grid.rowData)
            }

        }]);