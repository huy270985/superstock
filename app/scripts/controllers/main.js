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
        'tableSettings', '$tableRepository', '$gridSettings',
        function ($rootScope, $scope, $q, auth, $firebaseArray,
            $firebaseObject, Ref, draw, uiGridConstants, $sce, utils, currentAuth, $window, $compile, $filter, $timeout,
            tableSettings, $tableRepository, $gridSettings) {
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
                onColumnPinned: function(event) {
                    var column = event.column;
                    var field = column.colDef.field;
                    var pinned = event.pinned;
                    $tableRepository.saveColSetting(uid, tableSettings.name, field, {
                        pinned: pinned
                    })
                },
                onSortChanged: function(event, a) {
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

            var gridDiv = document.querySelector('#grid-market-options');
            if (gridDiv) {
                $scope.gridMarketOptions = $gridSettings.getGridMarketOptions();
                new agGrid.Grid(gridDiv, $scope.gridMarketOptions);
                utils.watchSellSymbols(function(arr) {
                    console.log('Sell symbols updated', arr);
                    var data = arr.map(function(item){
                        return {sellSignal: item}
                    });
                    if($scope.gridMarketOptions.api) {
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

            $tableRepository.loadColSettings(uid, tableSettings.name)
            .then(function(colSettings){
                var columnDefs = colSettings.map(function(colSetting){
                    //Setup column data
                    var def = {
                        field: colSetting.field, //field name
                        width: colSetting.width, //column width
                        headerName: colSetting.title, //column title
                        cellClass: colSetting.isNumber ? 'ui-cell-align-right' : 'ui-cell-align-left',
                        enableTooltip: true,
                        tooltipField: colSetting.field, //show tolltip
                        cellRenderer: function(params) {return $gridSettings.cellRenderer(colSetting, params)},
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

                return colSettings;
            })
            .then(function (colSettings) {
                /*
                * Get data from server and render to Grid
                */
                var config = {
                    idLabel: 'Mã',
                    labelList: colSettings.map(function(setting) {
                        return {
                            fieldName: setting.field,
                            format: setting.format,
                        }
                    })
                }
                var $gridData = {};
                draw.drawGrid(
                    $rootScope.user.account.active,
                    Ref.child(tableSettings.gridDataSource),
                    config,
                    function loading() {
                        $scope.gridMainOptions.api.showLoadingOverlay()
                    },

                    function loaded(data) {
                        console.log('Firebase loaded', data);
                        //loaded data
                        $scope.gridMainOptions.api.setRowData(data);
                    },
                    {
                        added: function (data, childSnapshot, id) {
                            console.debug('Record added', childSnapshot.key, data);
                            $gridData[childSnapshot.key] = data;
                            utils.debounce(function() {
                                var rowData = Object.keys($gridData).map(function(key){return $gridData[key]});
                                $scope.gridMainOptions.api.setRowData(rowData);
                            }, 100);
                        },

                        changed: function (data, childSnapshot, id) {
                            /*
                            * Data Changed Event
                            */
                            console.log('Record changed', childSnapshot.key, data);
                            $gridData[childSnapshot.key] = data;
                            utils.debounce(function() {
                                var rowData = Object.keys($gridData).map(function(key){return $gridData[key]});
                                $scope.gridMainOptions.api.setRowData(rowData);
                            }, 100);
                        },

                        removed: function (oldChildSnapshot) {
                            /*
                            * Data Removed Event
                            */
                            console.log('Record removed', oldChildSnapshot.key, oldChildSnapshot);
                            delete $gridData[oldChildSnapshot.key];
                            utils.debounce(function() {
                                var rowData = Object.keys($gridData).map(function(key){return $gridData[key]});
                                $scope.gridMainOptions.api.setRowData(rowData);
                            }, 100);
                        }
                    }
                )
            })

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