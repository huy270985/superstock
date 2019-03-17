/**
 * This is the main table factory
 *
 * It may be stupid but let's see if this works.
 *
 * The main grid is initlized directly via directive, e.g.:
*          <div ng-grid="gridMainOptions" ag-grid="gridMainOptions" class="ag-grid-custom ag-fresh" style="width: calc(100% - 70px);"></div>
 * After this, the setting can be accessed via $scope.gridMainOptions
 */

angular
.module('superstockApp')
.factory('$table', ['$tableRepository', '$gridSettings', 'utils',
    function ($tableRepository, $gridSettings, utils) {
        return {
            /**
             *
             */
            ready: function (handler) {
                $scope.gridMainOptions.api.onGridReady(function () {
                    handler();
                })
            },
            create: function ($rootScope, $scope, tableSettings, uid) {

                //Setup ag-grid
                $scope.gridMainOptions = {
                    enableSorting: true,
                    enableFilter: true,
                    suppressColumnVirtualisation: true,
                    suppressContextMenu: true,
                    rowData: [],
                    data: [],
                    enableColResize: true,
                    headerHeight: 50,
                    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Đang xử lý dữ liệu...</span>',
                    sortingOrder: ['desc', 'asc'],
                    //filter changed event
                    // see: https://www.ag-grid.com/javascript-grid-events/
                    onColumnPinned: function (event) {
                        var column = event.column;
                        var field = column.colDef.field;
                        var pinned = event.pinned;
                        $tableRepository.saveColSetting(uid, tableSettings.name, field, {
                            pinned: pinned
                        })
                    },
                    onSortChanged: function (event, a) {
                        console.log('Sort Changed', event, $scope.gridMainOptions.api.getSortModel());
                        /**
                         * Send data to google analytics
                         */
                        var sortModel = $scope.gridMainOptions.api.getSortModel();
                        if (sortModel) {
                            for (var i in sortModel) {
                                var colId = sortModel[i].colId;
                                var sort = sortModel[i].sort;
                                var column = $scope.gridMainOptions.columnApi.getColumn(colId);
                                $window.ga('send', {
                                    hitType: 'event',
                                    eventCategory: 'table:' + tableSettings.name,
                                    eventAction: 'sort',
                                    eventLabel: 'sort ' + sort + ' ' + column.colDef.field,
                                });
                            }
                        }
                    }
                };

                var $gridData = {};

                var gridDiv = document.querySelector('#grid-market-options');
                if (gridDiv) {
                    $scope.gridMarketOptions = $gridSettings.getGridMarketOptions();
                    new agGrid.Grid(gridDiv, $scope.gridMarketOptions);
                    utils.watchSellSymbols(function (arr) {
                        console.log('Sell symbols updated', arr);
                        var data = arr.map(function (item) {
                            return { sellSignal: item }
                        });
                        if ($scope.gridMarketOptions.api) {
                            $scope.gridMarketOptions.api.setRowData(data);
                        }
                        /**
                         * Set height for sellSignal
                         * Old code using pinLeft height,
                         * which will result in 0 height when there is no data for the name table
                         */
                        var $agBody = $('div[ng-grid="gridMainOptions"]').find('.ag-body');
                        var $gridMarket = $('#grid-market-options').find('.ag-body-viewport');
                        $gridMarket.height($agBody.height());
                        $gridMarket.css('background', '#F4CCCC');
                    });
                }

                return {
                    setColSettings: function (colSettings) {
                        var columnDefs = colSettings.map(function (colSetting) {
                            //Setup column data
                            var def = {
                                field: colSetting.field, //field name
                                width: colSetting.width, //column width
                                headerName: colSetting.title, //column title
                                cellClass: colSetting.isNumber ? 'ui-cell-align-right' : 'ui-cell-align-left',
                                enableTooltip: true,
                                tooltipField: colSetting.field, //show tolltip
                                cellRenderer: function (params) { return $gridSettings.cellRenderer(colSetting, params) },
                                headerCellTemplate: $gridSettings.headerCellTemplate,
                                sort: colSetting.field == tableSettings.defaultSort ? tableSettings.direction : undefined,
                                cellFilter: colSetting.isNumber ? 'number' : 'string',
                                pinned: colSetting.field == 'symbol' ? 'left' : colSetting.pinned,
                                suppressSorting: colSetting.field == 'sellSignal',
                            };

                            def.cellClass = function (params) {
                                // Get cell style
                                var selectedSyle = '';
                                if (params.data.symbol == $rootScope.mainSelected)
                                    selectedSyle = $rootScope.mainSelected;
                                return utils.getCellClassSummary(params, colSetting, selectedSyle);
                            }
                            return def;
                        })

                        $rootScope.filters = columnDefs;

                        if ($scope.gridMainOptions.api) {
                            $scope.gridMainOptions.api.setColumnDefs(columnDefs);
                        }
                    },

                    getHeaderConfig: function (colSettings) {
                        return {
                            idLabel: 'Mã',
                            labelList: colSettings.map(function (setting) {
                                return {
                                    fieldName: setting.field,
                                    format: setting.format,
                                }
                            })
                        }
                    },

                    loaded: function (data) {
                        console.log('Firebase loaded', data);
                        //loaded data
                        $scope.gridMainOptions.api.setRowData(data);
                    },

                    loading: function () {
                        $scope.gridMainOptions.api.showLoadingOverlay()
                    },

                    added: function (key, data) {
                        console.debug('Record added', key, data);
                        $gridData[key] = data;
                        utils.debounce(function () {
                            var rowData = Object.keys($gridData).map(function (key) { return $gridData[key] });
                            $scope.gridMainOptions.api.setRowData(rowData);
                        }, 100);
                    },

                    changed: function (key, data) {
                        /*
                        * Data Changed Event
                        */
                        console.log('Record changed', key, data);
                        $gridData[key] = data;
                        utils.debounce(function () {
                            var rowData = Object.keys($gridData).map(function (key) { return $gridData[key] });
                            $scope.gridMainOptions.api.setRowData(rowData);
                        }, 100);
                    },

                    removed: function (key) {
                        /*
                        * Data Removed Event
                        */
                        console.log('Record removed', key, $griData[key]);
                        delete $gridData[key];
                        utils.debounce(function () {
                            var rowData = Object.keys($gridData).map(function (key) { return $gridData[key] });
                            $scope.gridMainOptions.api.setRowData(rowData);
                        }, 100);
                    },
                }

            }
        }
    }]
)