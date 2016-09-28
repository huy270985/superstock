'use strict';

angular
    .module('superstockApp')
    .factory('utils', function () {
        return {
            getCellTemplate: function (fieldName, format) {
                switch (fieldName) {
                    case 'priceChange':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 0, \'"grid-cell-green"\': COL_FIELD >= 0}">{{COL_FIELD | number}}</div>';
                    case 'EPS':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 1000, \'"grid-cell-green"\': COL_FIELD > 1000}">{{COL_FIELD | number}}</div>';
                    case 'revenueChange':
                    case 'EPSChange':
                    case 'profitChange':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 0, \'"grid-cell-green"\': COL_FIELD > 0}">{{COL_FIELD | number}}</div>';
                    case 'point':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 5, \'"grid-cell-green"\': COL_FIELD >= 5, \'grid-cell-purple\': COL_FIELD >= 7}">{{COL_FIELD | number}}</div>';
                    case 'roe':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 10, \'"grid-cell-green"\': COL_FIELD > 10 }">{{COL_FIELD | number}}</div>';
                    case 'fxEffect':
                    case 'cashFlow':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 0, \'"grid-cell-green"\': COL_FIELD > 0 }">{{COL_FIELD | number}}</div>';
                    default:
                        if (format)
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
                }
            },
            getCellTemplateSummary: function (fieldName, format) {
                switch (fieldName) {
                    case 'symbol':
                        return '<div class="chart-pointer" title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true,\
                        \'grid-cell-purple\': grid.appScope.colorCanslim(row,\'purple\'), \
                        \'"grid-cell-green"\': grid.appScope.colorCanslim(row,\'green\'), \
                        \'grid-cell-fill\': grid.appScope.fillCanslim(row)}">{{COL_FIELD}}\
                        <img class=\'chart-icon\' src=\'./images/icon-graph.png\' ng-click="grid.appScope.symbolClick(row,col)"/></div>';
                    case 'totalValue':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true,\
                         \'grid-cell-purple\': COL_FIELD >= 5e9, \'grid-cell-fill\': COL_FIELD >= 5e9}">{{COL_FIELD | number}}</div>';
                    case 'EPS':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'"grid-cell-red"\': COL_FIELD < 1000, \'"grid-cell-green"\': COL_FIELD > 1000, \'grid-cell-fill grid-cell-purple\': COL_FIELD >= 3000}">{{COL_FIELD | number}}</div>';
                    case 'Canslim':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-purple\': COL_FIELD, \'grid-cell-fill\': COL_FIELD }">{{COL_FIELD}}</div>';
                    case 'pricePeak':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \
                        \'grid-cell-purple\': COL_FIELD && \'cao nhất 30 phiên\' == COL_FIELD.trim().toLowerCase(), \
                        \'grid-cell-fill\': COL_FIELD && \'cao nhất 30 phiên\' == COL_FIELD.trim().toLowerCase()}">{{COL_FIELD}}</div>';
                    case 'signal1':
                    case 'signal2':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-purple\': COL_FIELD, \'grid-cell-fill\': COL_FIELD}">{{COL_FIELD}}</div>';
                    case 'chart':
                    case 'symbol2':
                        return '<div class="chart-pointer" title="{{COL_FIELD}}" ng-click="grid.appScope.symbolClick(row,col)" ng-class="{\'ui-grid-cell-contents\': true,\
                        \'grid-cell-purple\': grid.appScope.colorCanslim(row,\'purple\'), \
                        \'"grid-cell-green"\': grid.appScope.colorCanslim(row,\'green\'), \
                        \'grid-cell-fill\': grid.appScope.fillCanslim(row)}">{{COL_FIELD}}</div>';
                    default:
                        if (format == 'number' || format == 'bigNum')
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
                }
            },
            getCellClass: function (params, format) {
                var field = params.colDef.field;
                var value = params.value;
                var classList = [];
                if (format[field].indexOf('number') > -1 || format[field].indexOf('percent') > -1 || format[field].indexOf('bigNum') > -1)
                    classList.push('ui-cell-align-right');
                if (params.value && format[field].indexOf('percent') > -1)
                    classList.push('percent');
                switch (field) {
                    case 'priceChange':
                        if (value < 0) classList.push("grid-cell-red");
                        else classList.push("grid-cell-green");
                        break;
                    case 'EPS':
                        if (value < 1000) classList.push("grid-cell-red");
                        else classList.push("grid-cell-green");
                        break;
                    case 'revenueChange':
                    case 'EPSChange':
                    case 'profitChange':
                        if (value < 0) classList.push("grid-cell-red");
                        else classList.push("grid-cell-green");
                        break;
                    case 'point':
                        if (value < 5) classList.push("grid-cell-red");
                        else if (value >= 5 && value < 7) classList.push("grid-cell-green");
                        else classList.push('grid-cell-purple');
                        break;
                    case 'roe':
                        if (value < 10) classList.push("grid-cell-red");
                        else classList.push("grid-cell-green");
                        break;
                    case 'fxEffect':
                    case 'cashFlow':
                        if (value < 0) classList.push("grid-cell-red");
                        else if (value > 0) classList.push("grid-cell-green");
                        break;
                }
                return classList;
            },
            getCellClassSummary: function (params, format) { // Define cell color for grid
                var field = params.colDef.field;
                var value = params.value;
                var classList = ['ag-cell-orange-bg'];
                if (format[field].indexOf('number') > -1 || format[field].indexOf('percent') > -1 || format[field].indexOf('bigNum') > -1)
                    classList.push('ui-cell-align-right');
                if (params.value && format[field].indexOf('percent') > -1)
                    classList.push('percent');
                switch (field) {
                    case 'symbol':
                        /**
                        * When this field has value
                        * - Background color will be filled
                        * When signal1 or signal 2 have value
                        * - if Canslim has data forceground color will be purple
                        * and otherwise it is green
                        */
                        if (value != '') {
                            if ((params.data.signal1 != '' || params.data.signal2 != '')) {
                                if (params.data.Canslim != '') {
                                    classList.push('ag-cell-purple-color');
                                } else {
                                    classList.push('grid-cell-green');
                                }
                                classList.push('ag-cell-fill-bg');
                            }
                        }
                        break;
                    case 'totalValue':
                        /**
                        * When this field has value and greater than 5.000.000.000
                        * background and forceground(purple) will be filled and 
                        */
                        if (value >= 5e9) {
                            classList.push('ag-cell-purple-color');
                            classList.push('ag-cell-fill-bg');
                        }
                        break;
                    case 'EPS':
                        /**
                        * When this field has value and
                        * >= 3000, background and forceground(purple) will be filled
                        * > 1000, forceground(green) will be filled
                        * < 1000, forceground(red) will be filled
                        */
                        if (value >= 3000) {
                            classList.push('ag-cell-purple-color');
                            classList.push('ag-cell-fill-bg');
                        } else if (value > 1000) {
                            classList.push('grid-cell-green');
                        } else if (value < 1000) {
                            classList.push('grid-cell-red');
                        }
                        break;
                    case 'newPoint':
                        /**
                        * When this field has value and
                        * >= 7, background and forceground(purple) will be filled
                        * >= 5, forceground(green) will be filled
                        * <= 4, forceground(red) will be filled
                        */
                        if (value >= 7) {
                            classList.push('ag-cell-purple-color');
                            classList.push('ag-cell-fill-bg');
                        } else if (value >= 5) {
                            classList.push('grid-cell-green');
                        } else if (value <= 4) {
                            classList.push('grid-cell-red');
                        }
                        classList.push('text-center');
                        break;
                    case 'Canslim':
                    case 'pricePeak':
                        /**
                        * When this field has value
                        * background and forceground(purple) will be filled
                        */
                        if (value != '') {
                            classList.push('ag-cell-fill-bg');
                            classList.push('ag-cell-purple-color');
                        } else {

                        }
                        classList.push('text-center');
                        break;
                    case 'symbol2':
                        /**
                        * When this field has value
                        * - Background color will be filled
                        * When signal1 or signal 2 have value
                        * - if Canslim has data forceground color will be purple
                        * and otherwise it is green
                        */
                        if (value != '') {
                            if ((params.data.signal1 != '' || params.data.signal2 != '')) {
                                if (params.data.Canslim != '') {
                                    classList.push('ag-cell-purple-color');
                                } else {
                                    classList.push('grid-cell-green');
                                }
                                classList.push('ag-cell-fill-bg');
                            }
                        }
                        classList.push('ag-cell-green-bg');
                        classList.push('text-center');
                        break;
                    case 'signal1':
                    case 'signal2':
                        /**
                        * When this field has value
                        * background and forceground(purple) will be filled
                        * and otherwise background is green
                        */
                        if (value != '') {
                            classList.push('ag-cell-fill-bg');
                            classList.push('ag-cell-purple-color');
                        }
                        classList.push('ag-cell-green-bg');
                        classList.push('text-center');
                        break;
                    case 'sellSignal':
                        /**
                         * Fill red background for cell which is sell signal
                         */
                        classList.push('ag-cell-red-bg');
                        classList.push('text-center');
                        break
                }
                return classList;
            },
            getMarketSummary: function () {
                /*
                * Get sell signals data
                * From link: https://superstock.firebaseio.com/sell_symbols.json
                */
                var dataArr = [];
                $.ajaxSetup({
                    async: false
                });
                var result = '';
                $.getJSON('https://superstock.firebaseio.com/market_summary.json', {}, function (data) {
                    if (data && data.data)
                        result = data.data;
                });
                return result;
            },
            getSellSignals: function () {
                /*
                * Get market summary data
                * From link: https://superstock.firebaseio.com/market_summary.json
                */
                $.ajaxSetup({
                    async: false
                });
                var result = [];
                $.getJSON('https://superstock.firebaseio.com/sell_symbols.json', {}, function (data) {
                    if (data && data.data)
                        result = data.data.split('|');
                });
                return result;
            },
            getCompanyInformation: function (id) {
                /*
                * Get market summary data
                * From link: https://superstock.firebaseio.com/profile/{{id}}.json
                */
                $.ajaxSetup({
                    async: false
                });
                var result = [];
                $.getJSON('https://superstock.firebaseio.com/profile/' + id + '.json', {}, function (data) {
                    if (data && data.data)
                        result = data.data;
                });
                return result;
            }
        }
    });