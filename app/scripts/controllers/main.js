'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', function ($rootScope, $scope, auth, $firebaseArray,
        $firebaseObject, Ref, draw, uiGridConstants, $sce, utils, currentAuth, $window, $compile, $filter) {
        $rootScope.link = 'main';
        $window.ga('send', 'event', "Page", "Tổng hợp");

        //Setup ag-grid
        $scope.gridOptions = {
            enableSorting: true,
            enableFilter: true,
            rowData: [],
            data: [],
            enableColResize: true,
            headerHeight: 50,
            //filter changed event
            onAfterFilterChanged: function () { },
            onCellClicked: function (params) { }
        };
        /*
        * Load title, header and format of field form server
        */
        var bigNum = 1000000000;
        var titles = $firebaseObject(Ref.child('summary_titles'));
        var fields = $firebaseObject(Ref.child('summary_headers'));
        var format = $firebaseObject(Ref.child('summary_format'));
        titles.$loaded(function () {
            fields.$loaded(function () {
                format.$loaded(function () {
                    var titlesArr = titles.data.split('|');
                    var fieldsArr = fields.data.split('|');
                    var formatArr = format.data.split('|');
                    var formatList = {};
                    
                    // Define size of field in client
                    var sizeArr = [
                        65, 250, 125, 95, 75, 75, 90, 140, 140, 60, 140
                    ]
                    var columnDefs = [];
                    var config = {
                        idLabel: 'Mã',
                        labelList: []
                    }


                    for (var i in titlesArr) {
                        formatList[fieldsArr[i]] = formatArr[i];
                        config.labelList.push({
                            fieldName: fieldsArr[i],
                            format: formatArr[i]
                        });
                        var formatType = null;
                        var cellClass = null;
                        if (formatArr[i].indexOf('bigNum') > -1 || formatArr[i].indexOf('number') > -1) {
                            formatType = 'number';
                            cellClass = 'ui-cell-align-right'
                        } else if (formatArr[i].indexOf('percent') > -1) {
                            cellClass = 'ui-cell-align-right'
                        } else {
                            cellClass = 'ui-cell-align-left'
                        }

                        //Setup column data
                        var def = {
                            field: fieldsArr[i], //field name
                            width: sizeArr[i], //column width
                            headerName: titlesArr[i], //column title
                            cellClass: cellClass, //css class of cell in column
                            enableTooltip: true,
                            tooltipField: fieldsArr[i], //show tolltip
                            cellRenderer: function (params) { //cell render event
                                if (params.colDef.field == 'symbol2') {
                                    /*
                                    * For "symbol2" column
                                    * - signal1 & signal2 is empty, show empty value
                                    */ 
                                    if (params.data.signal1 == '' && params.data.signal2 == '') {
                                        return '';
                                    }
                                } else if (params.colDef.field == 'newPoint' || params.colDef.field == 'EPS') {
                                    /*
                                    * For "newPoint" and "EPS" column
                                    * - Show number with format which has 2 points
                                    */ 
                                    if (isNaN(parseFloat(params.value))) {
                                        return $filter('number')(0, 2);
                                    } else {
                                        return $filter('number')(parseFloat(params.value), 2);
                                    }
                                }
                                else {
                                    if (!params.value) return '';
                                    if (formatList[params.colDef.field].indexOf('number') > -1 || formatList[params.colDef.field].indexOf('bigNum') > -1 || formatList[params.colDef.field].indexOf('percent') > -1)
                                        return $filter('number')(params.value);
                                }
                                return params.value;
                            },
                            headerCellTemplate: function (params) {
                                /*
                                * Header cell template, this will be render for all header cell of grid
                                */ 
                                var column = params.column;
                                var colId = column.colId;
                                var greenClass = '';
                                if (colId == 'signal1' || colId == 'symbol2' || colId == 'signal2')
                                    greenClass = 'ag-header-cell-green';
                                return (
                                    '<div class="ag-header-cell ' + greenClass + ' ag-header-cell-sortable ag-header-cell-sorted-none">' +
                                    '<table style="width:100%;height:100%">' +
                                    '<tr>' +
                                    '<td width="20px" style="vertical-align:top">' +
                                    '<span id="agMenu" class="ag-header-icon ag-header-cell-menu-button" style="opacity: 0; transition: opacity 0.2s, border 0.2s;">' +
                                    '<svg width="12" height="12"><rect y="0" width="12" height="2" class="ag-header-icon"></rect><rect y="5" width="12" height="2" class="ag-header-icon"></rect><rect y="10" width="12" height="2" class="ag-header-icon"></rect></svg>' +
                                    '</span>' +
                                    '</td>' +
                                    '<td>' +
                                    '<div id="agHeaderCellLabel" class="ag-header-cell-label">' +
                                    '<span id="agText" class="ag-header-cell-text"></span>' +
                                    '</div>' +
                                    '</td>' +
                                    '<td width="20px">' +
                                    '<div id="" class="ag-header-cell-label"><span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden"><svg width="10" height="10"><polygon points="0,10 5,0 10,10"></polygon></svg></span>    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden"><svg width="10" height="10"><polygon points="0,0 5,10 10,0"></polygon></svg></span><span id="agNoSort" class="ag-header-icon ag-sort-none-icon ag-hidden"><svg width="10" height="10"><polygon points="0,4 5,0 10,4"></polygon><polygon points="0,6 5,10 10,6"></polygon></svg></span><span id="agFilter" class="ag-header-icon ag-filter-icon ag-hidden"><svg width="10" height="10"><polygon points="0,0 4,4 4,10 6,10 6,4 10,0" class="ag-header-icon"></polygon></svg></span></div>' +
                                    '</td>' +
                                    '</tr>' +
                                    '</table>' +
                                    '</div>'
                                )
                            }
                        };

                        if (formatType) def.cellFilter = formatType; // add cell format (number or string)
                        if (formatArr[i].indexOf('percent') > -1) def.cellClass += ' percent';
                        def.cellTemplate = utils.getCellTemplateSummary(fieldsArr[i], formatArr[i]);
                        if (fieldsArr[i] == 'symbol') { //cell template for 'symbol' column
                            def.filter = 'text';
                            def.pinned = 'left'; //pin column to left
                            def.cellRenderer = function (params) { // render 'symbol' cell template
                                var id = params.value;
                                return '<div><span>' + params.value + '</span>' +
                                    '<img class="chart-icon" data-symbol="' + id +
                                    '" data-industry = "' + params.node.data.industry + '" src="./images/icon-graph.png">' + '</div>';
                            }
                        }

                        if (def.field == 'totalValue') {
                            def.sort = {
                                direction: 'desc',
                                priority: 0
                            }
                        }
                        if (def.field == 'industry') {
                            def.minWidth = 200;
                        }

                        def.cellClass = function (params) {
                            // Get cell style
                            return utils.getCellClassSummary(params, formatList);
                        }

                        columnDefs.push(def);
                    }

                    $rootScope.filters = columnDefs;

                    /*
                    * Get data from server and render to Grid
                    */
                    draw.drawGrid(Ref.child('summary_data'), config, function (data) {
                        //loading data
                    }, function (data) {
                        //loaded data
                        $scope.gridOptions.api.setColumnDefs(columnDefs);
                        $scope.gridOptions.api.setRowData(data);
                        $scope.gridOptions.columnApi.autoSizeColumns(fieldsArr);

                        // $rootScope.filterList = filterConvert($rootScope.filterList, filterData);
                        setTimeout(function () {
                            align();
                        }, 1000);
                    }, {
                            added: function (data, childSnapshot, id) {
                                //todo
                            },
                            changed: function (data, childSnapshot, id) {
                                //todo
                            },
                            removed: function (oldChildSnapshot) {
                                //todo
                            }
                        })

                    /*
                    * Graph chart click event
                    */
                    $scope.symbolClick = function (row, col) {
                        $('#myModal').modal('show');
                        $scope.stockInfo = row.entity.symbol + ' - ' + row.entity.industry;
                        $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + row.entity.symbol;
                        $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
                    }

                    /*
                    * Format header cell text
                    * - Set text align
                    * - Set margin
                    */
                    function align() {
                        $('.ui-grid-header-cell').each(function () {
                            var thisTag = $(this);
                            var span = thisTag.find('span');
                            if (span.text().indexOf('\n') < 0) {
                                span.parent().css('line-height', '40px');
                                thisTag.css('text-align', 'center');
                            } else {
                                span.last().css('margin-top', '-2px');
                            }
                        })
                    };

                })
            })
        })
    });