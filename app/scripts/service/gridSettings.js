'use strict';

angular
    .module('superstockApp')
    .factory('$gridSettings', ['utils', '$filter',
    function(utils, $filter) {
        return {

            getGridMarketOptions: function() {
                var columnDefs = [
                    {
                        headerName: "Báo bán",
                        field: "sellSignal",
                        width: 300,
                        headerCellTemplate: function () {
                            return (
                                '<div class="ag-header-cell ag-header-cell-red ag-header-cell-sortable ag-header-cell-sorted-none">' +
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
                            return utils.getCellClassSummary(params, { sellSignal: '' }, '');
                        }
                    }
                ];

                return {
                    enableSorting: false,
                    enableFilter: false,
                    rowData: [],
                    data: [],
                    headerHeight: 50,
                    enableColResize: false,
                    suppressNoRowsOverlay: true,
                    columnDefs: columnDefs
                }
            },

            headerCellTemplate: function(params) {
                function _getHeaderColorClass(field) {
                    if (field == 'signal1' || field == 'symbol2' || field == 'signal2')
                        return 'ag-header-cell-green';
                    if (field == 'sellSignal') {
                        return 'ag-header-cell-red';
                    }
                    return '';
                }

                var field = params.column.colDef.field;
                var colorClass = _getHeaderColorClass(field);
                return (
                    '<div class="ag-header-cell ag-header-cell-sortable ag-header-cell-sorted-none ' + colorClass + '">' +
                    '<table style="width:100%;height:100%">' +
                    '<tr>' +
                    '<td width="20px" style="vertical-align:top">' +
                    '<span id="agMenu" class="ag-header-icon ag-header-cell-menu-button" style="opacity: 0; transition: opacity 0.2s, border 0.2s;">' +
                    '<svg width="12" height="12"><rect y="0" width="12" height="2" class="ag-header-icon"></rect><rect y="5" width="12" height="2" class="ag-header-icon"></rect><rect y="10" width="12" height="2" class="ag-header-icon"></rect></svg>' +
                    '</span>' +
                    '<div id="" class="ag-header-cell-label"><span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden"><svg width="10" height="10"><polygon points="0,10 5,0 10,10"></polygon></svg></span>    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden"><svg width="10" height="10"><polygon points="0,0 5,10 10,0"></polygon></svg></span><span id="agNoSort" class="ag-header-icon ag-sort-none-icon ag-hidden"><svg width="10" height="10"><polygon points="0,4 5,0 10,4"></polygon><polygon points="0,6 5,10 10,6"></polygon></svg></span><span id="agFilter" class="ag-header-icon ag-filter-icon ag-hidden"><svg width="10" height="10"><polygon points="0,0 4,4 4,10 6,10 6,4 10,0" class="ag-header-icon"></polygon></svg></span></div>' +
                    '</td>' +
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

            cellRenderer: function(colSetting, params) {
                var field = params.colDef.field;
                if (field == 'symbol')
                    console.debug('Render cell', field, params.data);
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
                    case 'fxEffect':
                    case 'cashFlow':
                        /*
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
                            if (colSetting.type === 'percent') {
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
            },

        }

    }]);