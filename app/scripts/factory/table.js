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
.factory('$table', ['$tableRepository', '$gridSettings', 'utils', '$window',
    function ($tableRepository, $gridSettings, utils, $window) {
        return {
            /**
             *
             */
            ready: function (handler) {
                $scope.gridMainOptions.api.onGridReady(function () {
                    console.log("Grid Ready");
                    handler();
                })
            },
            create: function ($rootScope, $scope, tableSettings, uid, eventHandlers) {

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
                    angularCompileRows: true,
                    //filter changed event
                    // see: https://www.ag-grid.com/javascript-grid-events/
                    onGridReady: function (event) {
                        eventHandlers && "onGridReady" in eventHandlers && eventHandlers.onGridReady(event);
                    },

                    onColumnPinned: function (event) {
                        console.log("onColumnPinned", event);
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
                    },
                    onCellValueChanged: function (event) {
                        "onCellValueChanged" in eventHandlers && eventHandlers.onCellValueChanged(event);
                    },

                };

                var $gridData = {};

                return {
                    getData: function () {
                        return $gridData;
                    },

                    /**
                     * Filter rows that has matched symbol
                     * @param {required} symbol
                     */
                    getRowHasSymbol: function (symbol) {
                        return Object.values($gridData)
                            .filter(function (row) { return row.symbol == symbol });
                    },

                    /**
                     * Return the last record, may be useful to check an create an new record
                     * everytime the user fill the last row with data
                     */
                    getLastRecord: function () {
                        console.log("table getLastRecord()", this);
                        var keys = Object.keys($gridData)
                        return $gridData[keys[keys.length - 1]];
                    },

                    /**
                     * Add an empty row to the table,
                     * this function is useful if you want to append a pending row
                     * for user to edit
                     */
                    newRow: function () {
                        return this.added(Date.now(), {})
                    },

                    refresh: function () {
                        var rowData = Object.keys($gridData).map(function (key) { return $gridData[key] });
                        $scope.gridMainOptions.api.setRowData(rowData);
                    },

                    setColSettings: function (colSettings) {
                        var columnDefs = colSettings.map(function (colSetting) {
                            //Setup column data
                            var def = {
                                field: colSetting.field, //field name
                                width: colSetting.width, //column width
                                headerName: colSetting.title || "", //column title
                                enableTooltip: true,
                                tooltipField: colSetting.field, //show tolltip
                                headerCellTemplate: $gridSettings.headerCellTemplate,
                                sort: colSetting.field == tableSettings.defaultSort ? tableSettings.direction : undefined,
                                cellFilter: colSetting.isNumber ? 'number' : 'string',
                                pinned: colSetting.field == 'symbol' ? 'left' : colSetting.pinned,
                                suppressSorting: colSetting.field == 'sellSignal',
                                editable: colSetting.editable,
                            };

                            if (!colSetting.editable) {
                                def.cellRenderer = function (params) { return $gridSettings.cellRenderer(colSetting, params) }
                            }

                            if (colSetting.field == "delete") {
                                def.cellRenderer = function (params) {
                                    return '<div style="cursor:pointer" ng-click="deleteRecord(data,'+params.node.id+')">X</div>'
                                    // return '<i class="icon-trash cell-btn-remove" style="cursor:pointer" title="Delete this record" ng-click="deleteRecord(data,'+params.node.id+')">'
                                }
                            }

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

                    /**
                     * This function should only be used in the first time the data load
                     * will clear internal data storage of this table
                     */
                    loaded: function (data) {
                        $gridData = {};
                        for (var i in data) {
                            // main table use symbol, while personal portfolio will use just id
                            var key = data[i].id || data[i].symbol;
                            $gridData[key] = data[i];
                        }
                        console.debug("table.js - loaded", data, $gridData);
                        $scope.gridMainOptions.api.setRowData(data);
                    },

                    loading: function () {
                        $scope.gridMainOptions.api.showLoadingOverlay()
                    },

                    added: function (key, data) {
                        data.id = key;
                        $gridData[key] = data;
                        console.debug("table.js - added", key || "undefined", data, Object.keys($gridData), $gridData);
                        utils.debounce(function () {
                            var rowData = Object.keys($gridData).map(function (key) { return $gridData[key] });
                            $scope.gridMainOptions.api.setRowData(rowData);
                            console.debug("table.js - added debounce", rowData);
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
                        console.log('Record removed', key, $gridData[key]);
                        delete $gridData[key];
                        utils.debounce(function () {
                            var rowData = Object.keys($gridData).map(function (key) { return $gridData[key] });
                            $scope.gridMainOptions.api.setRowData(rowData);
                        }, 100);
                    },
                }

            },

            createSellSymbolTable: function (divId) {
                var id = '#' + divId;
                var gridDiv = document.querySelector(id);
                if (gridDiv) {
                    var sellSymbolOptions = $gridSettings.getGridMarketOptions();
                    new agGrid.Grid(gridDiv, sellSymbolOptions);
                    console.log("new grid for sell symbols")
                    utils.watchSellSymbols(function (arr) {
                        console.log('Sell symbols updated', arr);
                        var data = arr.map(function (item) {
                            return { sellSignal: item }
                        });
                        if (sellSymbolOptions.api) {
                            sellSymbolOptions.api.setRowData(data);
                        }
                        /**
                         * Set height for sellSignal
                         * Old code using pinLeft height,
                         * which will result in 0 height when there is no data for the name table
                         */
                        var $agBody = $('div[ng-grid="gridMainOptions"]').find('.ag-body');
                        var $gridMarket = $(id).find('.ag-body-viewport');
                        $gridMarket.height($agBody.height());
                        $gridMarket.css('background', '#F4CCCC');
                    });
                }

            },
        }
    }]
)