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
    .controller('RecommendationCtrl', ['$rootScope', '$scope', 'auth', 'currentAuth',
        'Ref', 'sellDataProvider', '$window',
        'tableSettings', '$tableRepository', '$table', 'common', 'utils',
        '$portfolioRepository',
        function ($rootScope, $scope, auth, currentAuth,
            Ref, sellDataProvider, $window,
            tableSettings, $tableRepository, $table, common, utils,
            $portfolioRepository) {
            $rootScope.link = tableSettings.name;
            $window.ga('send', 'pageview', "recomendation");
            var uid = auth.$getAuth().uid;
            common.syncMarketSummary($scope);
            common.syncTradingDate($scope);
            common.clickSymbolPopupDetails($scope);


            function recomputeRecord(data) {
                data.cutLoss = data.costPrice * 0.96;
                data.pnl = (data.close - data.costPrice) / data.costPrice * 100;
            }

            function updatePortfolioDistribution(portfolio) {
                var total = Object.keys(portfolio)
                    .map(function (key) { return portfolio[key].quantity * portfolio[key].close || 0})
                    .reduce(function (prev, curr) { return prev + curr });
                for (var key in portfolio) {
                    var value = portfolio[key].quantity * portfolio[key].close
                    portfolio[key].weight = value / total * 100
                }
            }

            const table = $table.create($rootScope, $scope, tableSettings, uid, {
                onGridReady: function () {
                    var colSettings = sellDataProvider.colSettings();
                    table.setColSettings(colSettings);
                    $portfolioRepository.loadAll(currentAuth.uid).then(function (data) {
                        console.log("RecommendationCtrl: User portoflio loaded", data);
                        if (data.length === 0) {
                            $scope.newRow();
                        }
                        else {
                            table.loaded(data);
                        }
                    });
                },

                onCellValueChanged: function (event) {
                    console.log("onCellValueChanged", event);
                    var data = event.data;
                    $portfolioRepository.saveEntry(currentAuth.uid, data);

                    if (event.colDef.field == "symbol") {
                        var newSymbol = event.newValue.toUpperCase();
                        data.symbol = newSymbol;
                        var oldSymbol = event.oldValue;
                        // subscribe
                        sellDataProvider.unsubscribe(oldSymbol);
                        sellDataProvider.subscribe({
                            changed: function (_, newData) {
                                // id of the row is independent from symbol now
                                data.close = newData.close;
                                data.take_profit = newData.take_profit;
                                data.two_down = newData.two_down;
                                data.broken_trend = newData.broken_trend;
                                recomputeRecord(data);
                                updatePortfolioDistribution(table.getData());
                                utils.debounce(function () {
                                    table.refresh();
                                }, 200)
                            }
                        }, newSymbol)
                    }

                    if (event.colDef.field == "costPrice" || event.colDef.field == "quantity") {
                        var data = event.data;
                        recomputeRecord(data);
                        updatePortfolioDistribution(table.getData());
                        utils.debounce(function () {
                            table.refresh();
                        }, 200)
                    }
                },

            });

            $scope.newRow = function () {
                var id = table.added(Date.now(), {})
            }

            $scope.deleteRecord = function (data, rowIndex) {
                console.debug("deleteRecord", data, rowIndex);
                $portfolioRepository.deleteEntry(currentAuth.uid, data.id)
                    .then(function () {
                        table.removed(data.id);
                    })
                // $scope.gridMainOptions.api.rowData.splice(selected.rowIndex, 1);
                // $scope.gridMainOptions.api.setRowData($scope.grid.rowData)
            }

        }]);