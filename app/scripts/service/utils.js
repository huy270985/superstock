'use strict';

angular
    .module('superstockApp')
    .factory('utils', function(){
        return {
            getCellTemplate: function(fieldName, format){
                switch(fieldName){
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
                        if(format)
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>'; 
                }
            }
        }
    }); 