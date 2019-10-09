'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:PersonalCtrl
 * @description
 * # PersonalCtrl
 * Controller of the superstockApp
 * Cột
 *      Mã cp / khối lượng/ giá vốn/ % phân bổ/ % lãi lỗ/ bán cắt lỗ/bán chặn lãi/giảm liên tục/gãy xu hướng
 */
angular.module('superstockApp')
    .controller('DiaryCtrl', ['$rootScope', '$scope', 'auth', 'currentAuth',
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

            $portfolioRepository.setName('diary');

            var _colSettings = [
                { field: "symbol", format: "", isNumber: false, title: "Mã", type: "", width: 80, editable: true, },
                { field: "close", format: "number:3:3:280", isNumber: true, title: "Giá hiện tại", type: "number", width: 70, editable: true, },
                { field: "quantity", format: "number:3:3:280", isNumber: true, title: "KL", type: "number", width: 70, editable: true, },
                { field: "buyPrice", format: "number:3:3:280", isNumber: true, title: "Giá \nmua", type: "number", width: 70, editable: true, },
                { field: "sellPrice", format: "number:3:3:280", isNumber: true, title: "Giá \nbán", type: "number", width: 70, editable: true, },
                { field: "pnlPercent", format: "number:3:3:280", isNumber: true, title: "Lãi lỗ %", type: "number", width: 100, },
                { field: "pnl", format: "number:3:3:280", isNumber: true, title: "Lãi lỗ tiền", type: "bigNum", width: 100, },
                { field: "buyDate", format: "number:3:3:280", isNumber: true, title: "Ngày mua", type: "", width: 90, editable: true, },
                { field: "sellDate", format: "number:3:3:280", isNumber: true, title: "Ngày bán", type: "", width: 90, editable: true, },
                { field: "note", format: "number:3:3:280", isNumber: true, title: "Ghi chú", type: "", width: 400, editable: true, },
                { field: "delete", width: 20, },
            ]

            function subscribeSellDataForRow(row, table) {
                sellDataProvider.subscribe({
                    changed: function (_, newData) {
                        // id of the row is independent from symbol now
                        var rows = table.getRowHasSymbol(row.symbol);
                        for (var i in rows) {
                            rows[i].close = +newData.close;
                            recomputeAndRefereshTable(rows[i], table);
                        }
                    }
                }, row.symbol);
            }

            function recomputeRecord(data) {
                data.pnlPercent = (data.sellPrice - data.buyPrice) / data.buyPrice * 100;
                data.pnl = (data.sellPrice - data.buyPrice) * data.quantity * 1000;
            }

            function recomputeAndRefereshTable(row, table) {
                console.debug('recomputeAndRefereshTable()', row, table);
                recomputeRecord(row);
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

            const table = $table.create($rootScope, $scope, tableSettings, uid, {
                onGridReady: function () {
                    var colSettings = _colSettings;
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
                    $portfolioRepository.saveEntry(currentAuth.uid, {
                        id: data.id,
                        symbol: data.symbol,
                        quantity: data.quantity,
                        buyPrice: data.buyPrice,
                        sellPrice: data.sellPrice,
                        buyDate: data.buyDate,
                        sellDate: data.sellDate,
                        note: data.note,
                    });

                    if (event.colDef.field == "buyPrice" ||
                        event.colDef.field == "sellPrice" ||
                        event.colDef.field == "quantity"
                        ) {
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