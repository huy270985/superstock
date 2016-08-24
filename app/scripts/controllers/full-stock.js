'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FullStockCtrl
 * @description
 * # FullStockCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FullStockCtrl', function($rootScope, $scope, auth, $firebaseArray,
        $firebaseObject, Ref, draw, uiGridConstants, $sce, utils, currentAuth, $window) {
        $rootScope.link = 'full';
        $window.ga('send', 'event', "Page", "Đầy đủ");
        var userFilters = null;
        var user = null;
        var userAuthData = null;
        var filterData = null;
        if (currentAuth) {
            var filter = $firebaseObject(Ref.child('users/' + currentAuth.uid + '/filter'));
            filter.$loaded(function(data) {
                filterData = {};
                for (var i in data) {
                    if (i.charAt(0) != '$' && i != 'forEach') {
                        filterData[i] = data[i];
                    }
                }
                if ($scope.gridOptions.columnDefs) {
                    $scope.gridOptions.columnDefs = filterConvert($scope.gridOptions.columnDefs, filterData);
                }
            });


            // defaultFilter.child('defaultFilter').set({
            //     "Cơ bản tốt": {
            //         point: 7,
            //         EPS: 1000,
            //         profitChange: 20,
            //         roe: 7,
            //         maVol30: 300000000
            //     }
            // }, function(err) {
            //     console.log(err);
            // })
        }
        $("#wrapper").addClass("toggled");
        $scope.iSrc = '';
        $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
        $scope.uiGridConstants = uiGridConstants;
        var heightOut = parseFloat($('.header').css('height')) + parseFloat($('.footer').css('height'));
        var heightWin = $(document).height();
        var heightHead = 30;
        $scope.gridOptions = {
            flatEntityAccess: true,
            fastWatch: true,
            enableFiltering: true,
            // useExternalFiltering: true,
            excessRows: 50,
            excessColumns: 32,
            minRowsToShow: Math.floor((heightWin - heightOut - 30 - heightHead) / 30),
            data: [],
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.core.on.filterChanged($scope, function() {
                    user = Ref.child('users/' + currentAuth.uid);
                    var filter = filterConvert($scope.gridOptions.columnDefs, null);
                    user.child('filter').set(filter, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Saved filter');
                        }
                    });
                });
            }
        };

        function filterConvert(rowDefs, filters) {
            if (filters) {
                for (var i in filters) {
                    for (var j in rowDefs) {
                        if (rowDefs[j].field == i) {
                            if (rowDefs[j].filters)
                                rowDefs[j].filters[0].term = filters[i];
                            else if (rowDefs[j].filter)
                                rowDefs[j].filter.term = filters[i];
                            break;
                        }
                    }
                }
                return rowDefs;
            } else {
                filters = {};
                for (var i in rowDefs) {
                    if (rowDefs[i].filters) {
                        filters[rowDefs[i].field] = (rowDefs[i].filters[0] && rowDefs[i].filters[0].term) ? rowDefs[i].filters[0].term : null;
                    } else if (rowDefs[i].filter) {
                        filters[rowDefs[i].field] = (rowDefs[i].filter.term) ? rowDefs[i].filter.term : null;
                    }
                }
                return filters;
            }
        }
        var bigNum = 1000000000;
        var titles = $firebaseObject(Ref.child('superstock_titles'));
        var fields = $firebaseObject(Ref.child('superstock_fields'));
        var format = $firebaseObject(Ref.child('superstock_format'));
        fields.$loaded(function() {
            titles.$loaded(function() {
                format.$loaded(function() {
                    var titlesArr = titles.data.split('|');
                    var fieldsArr = fields.data.split('|');
                    var formatArr = format.data.split('|');
                    console.log(formatArr);
                    console.log(titlesArr);
                    console.log(fieldsArr);
                    var sizeArr = [
                        50, 200, 110, 80, 80, 100, 100, 110,
                        60, 130, 140, 130, 70, 120, 80, 100,
                        120, 100, 100, 100, 80, 70, 70, 120,
                        120, 120, 150, 60, 120, 90, 120, 150
                    ];
                    var columnDefs = [];
                    var config = {
                        idLabel: 'Mã',
                        labelList: []
                    }
                    for (var i in titlesArr) {
                        // titlesArr[i] = titlesArr[i].replace('\n', '');
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
                        var def = {
                            field: fieldsArr[i],
                            width: sizeArr[i],
                            displayName: titlesArr[i],
                            cellClass: cellClass
                        }
                        if (formatType) def.cellFilter = formatType;
                        if (formatArr[i].indexOf('percent') > -1) def.cellClass += ' percent';
                        if (formatArr[i] != '') {
                            var arr = formatArr[i].split(':');
                            var filters = [{
                                condition: uiGridConstants.filter.GREATER_THAN,
                                placeholder: 'greater than',
                                term: (arr[0] == 'bigNum') ? parseFloat(arr[2]) * bigNum : parseFloat(arr[2]),
                                min: (arr[0] == 'bigNum') ? parseFloat(arr[1]) * bigNum : parseFloat(arr[1]),
                                bigNum: (arr[0] == 'bigNum') ? true : false
                            }, {
                                condition: uiGridConstants.filter.LESS_THAN,
                                placeholder: 'less than',
                                term: Infinity,
                                max: (arr[0] == 'bigNum') ? parseFloat(arr[3]) * bigNum : parseFloat(arr[3])
                            }];
                            def.filters = filters;
                            def.cellTemplate = utils.getCellTemplate(fieldsArr[i], true);
                        } else {
                            def.cellTemplate = utils.getCellTemplate(fieldsArr[i]);
                        }
                        if (fieldsArr[i] == 'shorttermSignal') {
                            def.filter = {
                                term: null,
                                // type: uiGridConstants.filter.SELECT,
                                selectOptions: [{
                                    value: 'xBán',
                                    label: 'Bán'
                                }, {
                                    value: 'xMua nếu cơ bản tốt',
                                    label: 'Mua'
                                }],
                                condition: function(searchTerm, cellValue) {
                                    var tempSearchTerm = [];
                                    for (var i in searchTerm) {
                                        tempSearchTerm.push(searchTerm[i].value);
                                    }
                                    if (!tempSearchTerm || searchTerm.length == 0) return true;
                                    return (tempSearchTerm.indexOf(cellValue) > -1);
                                }
                            }
                        } else if (fieldsArr[i] == 'industry') {
                            def.filter = {
                                // term: null,
                                // type: uiGridConstants.filter.SELECT,
                                selectOptions: [{
                                    value: 'Bao bì & đóng gói',
                                    label: 'Bao bì & đóng gói'
                                }, {
                                    value: 'Nông sản và thủy hải sản',
                                    label: 'Nông sản và thủy hải sản'
                                }, {
                                    value: 'Ngân hàng',
                                    label: 'Ngân hàng'
                                }, {
                                    value: 'Thực phẩm',
                                    label: 'Thực phẩm'
                                }],
                                // selectOptions: ['Bao bì & đóng gói', 'Nông sản và thủy hải sản', 'Ngân hàng', 'Thực phẩm'],
                                typeSearch: 'multiple',
                                term: null,
                                condition: function(searchTerm, cellValue) {
                                    var tempSearchTerm = [];
                                    for (var i in searchTerm) {
                                        tempSearchTerm.push(searchTerm[i].value);
                                    }
                                    if (!tempSearchTerm || searchTerm.length == 0) return true;
                                    return (tempSearchTerm.indexOf(cellValue) > -1);
                                }
                            }
                        }
                        columnDefs.push(def);
                    }
                    for (var i in columnDefs) {
                        if (columnDefs[i].field == 'symbol') {
                            columnDefs[i].pinnedLeft = true;
                            columnDefs[i].cellTemplate = '<div><div ng-click="grid.appScope.symbolClick(row,col)" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>';
                        }
                    }
                    $rootScope.filters = columnDefs;
                    $scope.gridOptions.columnDefs = columnDefs;
                    console.log(columnDefs);
                    if (filterData) {
                        $scope.gridOptions.columnDefs = filterConvert($scope.gridOptions.columnDefs, filterData);
                    }
                    draw.drawGrid(Ref.child('superstock'), config, function(data) {
                        $scope.gridOptions.data.push(data);
                    }, function(data) {
                        // columnDefs[0].pinnedLeft = true
                        // $scope.gridOptions.columnDefs = columnDefs;
                        // $scope.gridOptions.data = data;
                        // console.log($scope.gridOptions.data);
                    }, {
                        added: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.gridOptions.data[i] = data;
                                    return;
                                }
                            }
                            $scope.gridOptions.data.push(data);
                        },
                        changed: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.$apply(function() {
                                        for (var key in data) {
                                            $scope.gridOptions.data[i][key] = data[key];
                                        }
                                    })
                                    break;
                                }
                            }
                        },
                        removed: function(oldChildSnapshot) {
                            var key = oldChildSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.gridOptions.data.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    })
                })
            })
        });

        $rootScope.parseBigNum = function(term) {
            var newTerm = parseFloat(term) / bigNum;
            return newTerm;
        }
        $scope.symbolClick = function(row, col) {
            $('#myModal').modal('show');
            $scope.stockInfo = row.entity.symbol + ' - ' + row.entity.industry;
            $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + row.entity.symbol;
            $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
        }

        $rootScope.search = function(searchTerm) {
            $scope.gridApi.grid.columns[0].filters[0] = {
                term: $rootScope.searchTerm
            };
        }
        $rootScope.defaultFilter = function(filter) {
            if (filter) filter = filter[0];
            else return;
            $window.ga('send', 'event', "Filter", filter.filterName);
            for (var i in $scope.gridOptions.columnDefs) {
                var fieldName = $scope.gridOptions.columnDefs[i].field;
                for (var j in filter) {
                    if (j != 'filterName') {
                        if (j == fieldName) {
                            if ($scope.gridOptions.columnDefs[i].filters) {
                                $scope.gridOptions.columnDefs[i].filters[0].term = filter[j];
                            }
                            break;
                        }
                    }
                }
            }
        }

        // var defaultFormat = Ref.children('')

        // $scope.industryClick = function(index, row, col) {
        //     var industry = row.entity.industry;
        // }
        $(document).ready(function() {
            $(document).on('change', '.subTerm', function() {
                var subTerm = $(this);
                subTerm.prop('value', subTerm.val());
                var field = subTerm.prop('id');
                for (var i in $scope.gridOptions.columnDefs) {
                    if ($scope.gridOptions.columnDefs[i].field == field) {
                        $scope.$apply(function() {
                            $scope.gridOptions.columnDefs[i].filters[0].term = parseFloat(subTerm.val()) * bigNum;
                            subTerm.prop('value', subTerm.val());
                        })
                        break;
                    }
                }
                subTerm.parent().next().children().slider({
                    slide: function(event, ui) {
                        subTerm.prop('value', ui.value / bigNum);
                    }
                });
            });
        })
    })
    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });