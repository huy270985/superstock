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
                data.pnlValue = (data.close - data.costPrice) * data.quantity * 1000;
                data.totalCost = data.costPrice * data.quantity * 1000;
                data.totalValue = +data.quantity * +data.close * 1000;
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

            function recomputeAndRefereshTable(data, table) {
                recomputeRecord(data);
                updatePortfolioDistribution(table.getData());
                utils.debounce(function () {
                    table.refresh();
                }, 200);
            }

            // auto add new row for user after editing
            // so he doesn't have to click "Add Row"
            function prepareEmptyRowToEdit(table) {
                var lastRecord = table.getLastRecord();
                if (lastRecord.symbol) {
                    table.newRow();
                }
            }

            function subscribeSellDataForRow(row, table) {
                sellDataProvider.subscribe({
                    changed: function (_, newData) {
                        // id of the row is independent from symbol now
                        row.close = newData.close;
                        row.take_profit = newData.take_profit;
                        row.two_down = newData.two_down;
                        row.broken_trend = newData.broken_trend;
                        recomputeAndRefereshTable(row, table);
                    }
                }, row.symbol);
            }

            const table = $table.create($rootScope, $scope, tableSettings, uid, {
                onGridReady: function () {
                    var colSettings = sellDataProvider.colSettings();
                    table.setColSettings(colSettings);
                    $portfolioRepository.loadAll(currentAuth.uid).then(function (data) {
                        console.log("RecommendationCtrl: User portoflio loaded", data);
                        if (data.length === 0) {
                            table.newRow();
                        }
                        else {
                            table.loaded(data);
                            prepareEmptyRowToEdit(table);
                            for (var i in data) {
                                /**
                                 * Here 2 row may contain same symbol so we may subscribe
                                 * to 1 symbol's sell data twice
                                 * this may not be efficient but keep the logic flow simpler
                                 */
                                subscribeSellDataForRow(data[i], table);
                            }
                        }
                    });
                },

                onCellValueChanged: function (event) {
                    console.log("onCellValueChanged", event);
                    var data = event.data;

                    if (event.colDef.field == "symbol") {
                        var newSymbol = event.newValue.toUpperCase();
                        data.symbol = newSymbol;
                        var oldSymbol = event.oldValue;
                        // subscribe
                        sellDataProvider.unsubscribe(oldSymbol);
                        subscribeSellDataForRow(data, table);
                    }

                    // save entry after uppercase to standardize symbol
                    $portfolioRepository.saveEntry(currentAuth.uid, data);

                    if (event.colDef.field == "costPrice" || event.colDef.field == "quantity") {
                        recomputeAndRefereshTable(event.data, table);
                    }

                    prepareEmptyRowToEdit(table);
                },

            });

            $scope.deleteRecord = function (data, rowIndex) {
                console.debug("deleteRecord", data, rowIndex);
                $portfolioRepository.deleteEntry(currentAuth.uid, data.id)
                    .then(function () {
                        table.removed(data.id);
                    })
            }

        }]);