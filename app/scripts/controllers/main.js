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
        'tableSettings',
        function ($rootScope, $scope, $q, auth, $firebaseArray,
            $firebaseObject, Ref, draw, uiGridConstants, $sce, utils, currentAuth, $window, $compile, $filter, $timeout,
            tableSettings) {
            $rootScope.link = tableSettings.name;
            $window.ga('send', 'pageview', "Tổng hợp");
            var uid = auth.$getAuth().uid;
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
                    var userTableSettings = $firebaseObject(Ref.child('users/' + uid + '/tableSettings/' + tableSettings.name + '/' + field))
                    userTableSettings.pinned = pinned;
                    userTableSettings.$save();
                },
            };
            var columnDefs = [
                {
                    headerName: "Báo bán",
                    field: "sellSignal",
                    width: 70,
                    headerCellTemplate: function (params) {
                        /*
                        * Header cell template, this will be render for all header cell of grid
                        */
                        var colorClass = 'ag-header-cell-red';

                        return (
                            '<div class="ag-header-cell ' + colorClass + ' ag-header-cell-sortable ag-header-cell-sorted-none">' +
                            '<table style="width:100%;height:100%">' +
                            '<tr>' +
                            '<td>' +
                            '<div id="agHeaderCellLabel" class="ag-header-cell-label">' +
                            '<span id="agText" class="ag-header-cell-text"></span>' +
                            '</div>' +
                            '</td>' +
                            '</tr>' +
                            '</table>' +
                            '</div>'
                        )
                    },
                    cellClass: function (params) {
                        // Get cell style
                        var selectedSyle = '';
                        if (params.data.symbol == $rootScope.mainSelected)
                            selectedSyle = $rootScope.mainSelected;
                        return utils.getCellClassSummary(params, { sellSignal: '' }, selectedSyle);
                    }
                }
            ];


            $scope.gridMarketOptions = {
                enableSorting: false,
                enableFilter: false,
                rowData: [],
                data: [],
                headerHeight: 50,
                enableColResize: false,
                suppressNoRowsOverlay: true,
                columnDefs: columnDefs
            }

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

            /*
            * Load title, header and format of field form server
            */
            var titles = $firebaseObject(Ref.child('summary_titles'));
            var fields = $firebaseObject(Ref.child('summary_headers'));
            var format = $firebaseObject(Ref.child('summary_format'));
            var userTableSettings = $firebaseObject(Ref.child('users/' + uid + '/tableSettings/' + tableSettings.name));

            $q.all([titles.$loaded(), fields.$loaded(), format.$loaded(), userTableSettings.$loaded()]).then(function(){
                if (!titles.data || !fields.data || !format.data) {
                    throw new Error("One or all format data could not be loaded from server, check your firebase realtime database");
                }
                var titlesArr = titles.data.split('|');
                var fieldsArr = fields.data.split('|');
                var formatArr = format.data.split('|');

                // Define size of field in client
                //"symbol|matchPrice|priceChange|totalValue|volumeChange|EPS|newPoint|Canslim|pricePeak|signal1|symbol2"
                var defaultTableSettings = {
                    symbol: { width: 90},
                    matchPrice: { width: 100},
                    priceChange: { width: 100},
                    totalValue: { width: 125},
                    volumeChange: { width: 95},
                    EPS: { width: 65},
                    newPoint: { width: 75},
                    Canslim: { width: 105},
                    pricePeak: { width: 100},
                    signal1: { width: 130},
                    symbol2: { width: 75},
                    signal2: { width: 130},
                }

                // merge defaultTableSettings & userTableSettings
                for (var i in titlesArr) {
                    var userSetting = userTableSettings[fieldsArr[i]] || {};
                    var defaultSetting = defaultTableSettings[fieldsArr[i]] || {width: 90};
                    userTableSettings[fieldsArr[i]] = Object.assign(
                        userSetting,
                        defaultSetting,
                        {
                            field: fieldsArr[i],
                            title: titlesArr[i],
                            format: formatArr[i],
                        }
                    );
                }

                var colSettings = []
                for (var i in titlesArr) {
                    var field = fieldsArr[i];
                    var setting = userTableSettings[field];
                    // crazy closure handling
                    var isType = (function(format) {
                            return function(type) {
                                return format.indexOf(type) > -1
                            }
                        })(setting.format);

                    colSettings[i] = Object.assign({
                        isType: isType,
                        isNumber: isType('bigNum') || isType('number') || isType('percent'),
                    }, setting);
                }

                function cellRenderer(colSetting, params) {
                    var field = params.colDef.field;
                    switch(field) {
                        case 'symbol2':
                            /*
                            * For "symbol2" column
                            * - signal1 & signal2 is empty, show empty value
                            */
                            if (params.data.signal1 == '' && params.data.signal2 == '') {
                                return '<div data-symbol="' + params.data.symbol + '" title=""></div>';
                            } else {
                                return '<div class="chart-icon" data-symbol="' + params.data.symbol + '" title="' + params.value + '">' + params.value + '</div>';
                            }
                        case 'newPoint':
                        case 'EPS':
                            /*
                            * For "newPoint" and "EPS" column
                            * - Show number with format which has 2 points
                            */
                            var value = '';
                            if (isNaN(parseFloat(params.value))) {
                                value = $filter('number')(0, 0);
                            } else {
                                value = $filter('number')(parseFloat(params.value), 0);
                            }
                            return '<div data-symbol="' + params.data.symbol + '" title="' + value + '">' + value + '</div>';
                        case 'symbol':
                            var id = params.value;
                            return '<div><span>' + params.value + '</span>' +
                                '<img class="chart-icon" data-symbol="' + id +
                                '" data-industry = "' + params.node.data.industry + '" src="./images/icon-graph.png">' +
                                '<img class="information-icon" data-symbol="' + id +
                                '" data-industry = "' + params.node.data.industry + '" src="./images/icon-information.png" />' + '</div>';
                        default:
                            var value = '';
                            if (colSetting.isNumber) {
                                value = $filter('number')(params.value);
                                if (colSetting.isType('percent')) {
                                    if (isNaN(parseFloat(params.value))) {
                                        value = '';
                                    } else {
                                        value = $filter('number')(params.value, 2);
                                        value = value + '%';
                                    }
                                }
                                return '<div data-symbol="' + params.data.symbol + '" title="' + value + '">' + value + '</div>';
                            }
                            return '<div data-symbol="' + params.data.symbol + '" title="' + params.value + '">' + params.value + '</div>';
                    }
                }

                function headerCellTemplate(params) {
                    /*
                    * Header cell template, this will be render for all header cell of grid
                    */
                    var column = params.column;
                    var colId = column.colId;
                    var colorClass = '';
                    if (colId == 'signal1' || colId == 'symbol2' || colId == 'signal2')
                        colorClass = 'ag-header-cell-green';
                    var agMenu = '<td width="20px" style="vertical-align:top">' +
                        '<span id="agMenu" class="ag-header-icon ag-header-cell-menu-button" style="opacity: 0; transition: opacity 0.2s, border 0.2s;">' +
                        '<svg width="12" height="12"><rect y="0" width="12" height="2" class="ag-header-icon"></rect><rect y="5" width="12" height="2" class="ag-header-icon"></rect><rect y="10" width="12" height="2" class="ag-header-icon"></rect></svg>' +
                        '</span>' +
                        '</td>';
                    var agSort = '<td width="20px">' +
                        '<div id="" class="ag-header-cell-label"><span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden"><svg width="10" height="10"><polygon points="0,10 5,0 10,10"></polygon></svg></span>    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden"><svg width="10" height="10"><polygon points="0,0 5,10 10,0"></polygon></svg></span><span id="agNoSort" class="ag-header-icon ag-sort-none-icon ag-hidden"><svg width="10" height="10"><polygon points="0,4 5,0 10,4"></polygon><polygon points="0,6 5,10 10,6"></polygon></svg></span><span id="agFilter" class="ag-header-icon ag-filter-icon ag-hidden"><svg width="10" height="10"><polygon points="0,0 4,4 4,10 6,10 6,4 10,0" class="ag-header-icon"></polygon></svg></span></div>' +
                        '</td>';
                    if (colId == 'sellSignal') {
                        agSort = '';
                        agMenu = '';
                        colorClass = 'ag-header-cell-red';
                    }
                    return (
                        '<div class="ag-header-cell ' + colorClass + ' ag-header-cell-sortable ag-header-cell-sorted-none">' +
                        '<table style="width:100%;height:100%">' +
                        '<tr>' +
                        agMenu +
                        '<td>' +
                        '<div id="agHeaderCellLabel" class="ag-header-cell-label">' +
                        '<span id="agText" class="ag-header-cell-text"></span>' +
                        '</div>' +
                        '</td>' +
                        agSort +
                        '</tr>' +
                        '</table>' +
                        '</div>'
                    )
                }

                var columnDefs = colSettings.map(function(colSetting){
                    //Setup column data
                    var def = {
                        field: colSetting.field, //field name
                        width: colSetting.width, //column width
                        headerName: colSetting.title, //column title
                        cellClass: colSetting.isNumber ? 'ui-cell-align-right' : 'ui-cell-align-left',
                        enableTooltip: true,
                        tooltipField: colSetting.field, //show tolltip
                        cellRenderer: function(params) {return cellRenderer(colSetting, params)},
                        headerCellTemplate: headerCellTemplate,
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

                /*
                * Get data from server and render to Grid
                */
                var $eventTimeout;
                var $gridData = [];

                var config = {
                    idLabel: 'Mã',
                    labelList: []
                }

                for (var i in fieldsArr) {
                    config.labelList.push({
                        fieldName: fieldsArr[i],
                        format: formatArr[i]
                    });
                }


                var sellSignalDatas = [];
                if ($scope.gridMainOptions.api) {
                    $scope.gridMainOptions.api.setColumnDefs(columnDefs);

                    var gridDiv = document.querySelector('#grid-market-options');
                    new agGrid.Grid(gridDiv, $scope.gridMarketOptions);

                    draw.drawGrid(Ref.child(tableSettings.gridDataSource), config, function (data) {
                        //loading data
                        $scope.gridMainOptions.api.showLoadingOverlay()
                    }, function (data) {
                        /*
                        Hide data for unpaid user
                        */
                        if(!$rootScope.user.account.active) {
                            for(var i = 0; i < data.length; i++) {
                                var txt = "Bản thu phí";
                                data[i].signal1 = txt;
                                data[i].signal2 = txt;
                                data[i].symbol2 = txt;
                                data[i].Canslim = txt;
                                data[i].power = txt;
                                if(tableSettings.hideSymbol) {
                                    data[i].symbol = txt;
                                }
                            }
                        }
                        //loaded data
                        $scope.gridMainOptions.api.setRowData(data);
                        // add the handler function
                        $scope.gridMainOptions.api.addEventListener('afterSortChanged', function (params) {
                            var updatedNodes = [];
                            if ($scope.gridMainOptions.api && $scope.gridMainOptions.api != null) {
                                $scope.gridMainOptions.api.forEachNode(function (node) {
                                    var value = '';
                                    if (sellSignalDatas[node.childIndex])
                                        value = sellSignalDatas[node.childIndex];
                                    node.data.sellSignal = value;
                                    updatedNodes.push(node);
                                });
                                $scope.gridMainOptions.api.refreshCells(updatedNodes, ['sellSignal']);

                                /**
                                 * Send data to google analytics
                                 */
                                var sortModel = $scope.gridMainOptions.api.getSortModel();
                                if (sortModel) {
                                    for (var i in sortModel) {
                                        var colId = sortModel[i].colId;
                                        var sort = sortModel[i].sort;
                                        var column = $scope.gridMainOptions.columnApi.getColumn(colId);
                                        var headerName = column.colDef.headerName;
                                        $window.ga('send', {
                                            hitType: 'event',
                                            eventCategory: 'Tổng hợp - Sắp xếp dữ liệu',
                                            eventAction: 'Xắp xếp',
                                            eventLabel: 'Xắp xếp ' + (sort == 'desc' ? 'giảm dần' : 'tăng dần') + ' theo ' + headerName
                                        });
                                    }
                                }
                            }
                        });
                    }, {
                            added: function (data, childSnapshot, id) {
                                /*
                                * Update data in grid when server update data
                                * Here we hide signal for inactive user, only paid user see the details.
                                TODO: duplicate with first load process
                                */
                                if(!$rootScope.user.account.active) {
                                    var txt = "Bản thu phí";
                                    data.signal1 = txt;
                                    data.signal2 = txt;
                                    data.symbol2 = txt;
                                    data.Canslim = txt;
                                    data.power = txt;
                                    if(tableSettings.hideSymbol) {
                                        data.symbol = txt;
                                    }
                                }

                                $gridData.push(data);
                                if ($eventTimeout) {
                                    //
                                } else {
                                    $eventTimeout = $timeout(function () {
                                        if ($scope.gridMainOptions.api && $scope.gridMainOptions.api != null) {
                                            $scope.gridMainOptions.api.setRowData($gridData);
                                            /**
                                             * Fill data for sell signal column
                                             */
                                            utils.getSellSignals().then(function (data) {
                                                $scope.gridMarketOptions.api.setRowData(data);
                                                /**
                                                 * Set height for sellSignal
                                                 */
                                                var $agBody = $('div[ng-grid="gridMainOptions"]').find('.ag-body');
                                                var $pinLeft = $('div[ng-grid="gridMainOptions"]').find('.ag-pinned-left-cols-container');
                                                var $gridMarket = $('#grid-market-options').find('.ag-body-viewport');
                                                var height = $pinLeft.height();
                                                if (height >= $agBody.height())
                                                    height = $agBody.height();
                                                $gridMarket.height(height);
                                                $gridMarket.css('background', '#F4CCCC');
                                            }).catch(function (ex) {
                                            });
                                        }
                                        $gridData = [];
                                        $eventTimeout = undefined;
                                    }, 1000);
                                }
                            },
                            changed: function (data, childSnapshot, id) {
                                /*
                                * Data Changed Event
                                */
                            },
                            removed: function (oldChildSnapshot) {
                                /*
                                * Data Removed Event
                                */
                            }
                        })
                }

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

                        });
                    });
                });
            });
        }]);