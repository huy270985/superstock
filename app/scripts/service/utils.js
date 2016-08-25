'use strict';

angular
    .module('superstockApp')
    .factory('utils', function() {
        return {
            getCellTemplate: function(fieldName, format) {
                switch (fieldName) {
                    case 'priceChange':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 0, \'grid-cell-green\': COL_FIELD >= 0}">{{COL_FIELD | number}}</div>';
                    case 'EPS':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 1000, \'grid-cell-green\': COL_FIELD > 1000}">{{COL_FIELD | number}}</div>';
                    case 'revenueChange':
                    case 'EPSChange':
                    case 'profitChange':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 0, \'grid-cell-green\': COL_FIELD > 0}">{{COL_FIELD | number}}</div>';
                    case 'point':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 5, \'grid-cell-green\': COL_FIELD >= 5, \'grid-cell-purple\': COL_FIELD >= 7}">{{COL_FIELD | number}}</div>';
                    case 'roe':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 10, \'grid-cell-green\': COL_FIELD > 10 }">{{COL_FIELD | number}}</div>';
                    case 'fxEffect':
                    case 'cashFlow':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 0, \'grid-cell-green\': COL_FIELD > 0 }">{{COL_FIELD | number}}</div>';
                    default:
                        if (format)
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
                }
            },
            getCellTemplateSummary: function(fieldName, format) {
                switch (fieldName) {
                    case 'totalValue':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true,\
                         \'grid-cell-purple\': COL_FIELD >= 5e9, \'grid-cell-fill\': COL_FIELD >= 5e9}">{{COL_FIELD | number}}</div>';
                    case 'EPS':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 1000, \'grid-cell-green\': COL_FIELD > 1000, \'grid-cell-fill\': COL_FIELD >= 3000}">{{COL_FIELD | number}}</div>';
                    case 'Canslim':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-purple\': COL_FIELD, \'grid-cell-fill\': COL_FIELD }">{{COL_FIELD}}</div>';
                    case 'pricePeak': ///Vượt đỉnh giá, chưa biết server trả về field tên gì 
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \
                        \'grid-cell-purple\': COL_FIELD && \'cao nhất 30 phiên\' == COL_FIELD.trim().toLowerCase(), \
                        \'grid-cell-fill\': COL_FIELD && \'cao nhất 30 phiên\' == COL_FIELD.trim().toLowerCase()}">{{COL_FIELD}}</div>';
                    case 'signal1':
                    case 'signal2':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-purple\': COL_FIELD, \'grid-cell-fill\': COL_FIELD}">{{COL_FIELD}}</div>';
                    case 'chart':
                    case 'symbol2':
                        return '<div title="{{COL_FIELD}}" ng-init="" ng-class="{\'ui-grid-cell-contents\': true,\
                        \'grid-cell-purple\': grid.appScope.colorCanslim(row,\'purple\'), \
                        \'grid-cell-green\': grid.appScope.colorCanslim(row,\'green\'), \
                        \'grid-cell-fill\': grid.appScope.fillCanslim(row)}">{{COL_FIELD}}</div>';
                    default:
                        if (format == 'number' || format == 'bigNumber')
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
                }
            }
        }
    });