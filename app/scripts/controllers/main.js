'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', function($rootScope, $scope, $firebaseArray, $firebaseObject, Ref, draw, utils, $window, $sce) {
        $rootScope.link = 'main';
        $window.ga('send', 'event', "Page", "Tổng hợp");


        $('.view-containner').css('width', $(document).width() + 'px');
        $("#wrapper").addClass("toggled");
        var heightOut = parseFloat($('.header').css('height')) + parseFloat($('.footer').css('height'));
        var heightWin = $(document).height();
        var heightHead = 30;
        $scope.gridOptions = {
            minRowsToShow: Math.floor((heightWin - heightOut - heightHead) / 30),
            data: []
        };
        console.log($scope.gridOptions);
        var titles = $firebaseObject(Ref.child('summary_titles'));
        var fields = $firebaseObject(Ref.child('summary_headers'));
        var format = $firebaseObject(Ref.child('summary_format'));
        titles.$loaded(function() {
            fields.$loaded(function() {
                format.$loaded(function() {
                    var titlesArr = titles.data.split('|');
                    var fieldsArr = fields.data.split('|');
                    var formatArr = format.data.split('|');
                    console.log(formatArr);
                    console.log(titlesArr);
                    console.log(fieldsArr);
                    var colWidths = [
                        70, '*', 130, 80, 80, 80, 80, 140, 130, 100, 130
                    ]
                    var columnDefs = [];
                    var config = {
                        idLabel: 'Mã',
                        labelList: []
                    }
                    for (var i in titlesArr) {
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
                            displayName: titlesArr[i],
                            cellClass: cellClass,
                            width: colWidths[i]
                        }
                        if (formatType) def.cellFilter = formatType;
                        if (formatArr[i].indexOf('percent') > -1) def.cellClass += ' percent';
                        def.cellTemplate = utils.getCellTemplateSummary(fieldsArr[i], formatArr[i]);
                        columnDefs.push(def);
                    }
                    for (var i in columnDefs) {
                        if (columnDefs[i].field == 'symbol') {
                            columnDefs[i].pinnedLeft = true;
                            // columnDefs[i].cellTemplate = '<div class="chart-pointer"><div ng-click="grid.appScope.symbolClick(row,col)" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>';
                        }
                        if (columnDefs[i].field == 'totalValue') {
                            columnDefs[i].sort = {
                                direction: 'desc',
                                priority: 0
                            }
                        }
                    }
                    // $rootScope.filters = columnDefs;
                    $scope.gridOptions.columnDefs = columnDefs;
                    draw.drawGrid(Ref.child('summary_data'), config, function(data) {
                        $scope.gridOptions.data.push(data);
                    }, function(data) {
                        setTimeout(function() {
                            // align();
                        }, 1000);
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
                    });
                    $scope.symbolClick = function(row, col) {
                        $('#myModal').modal('show');
                        $scope.stockInfo = row.entity.symbol + ' - ' + row.entity.industry;
                        $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + row.entity.symbol;
                        $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
                    }

                    $scope.fillCanslim = function(row) {
                        if ((row.entity.signal1 != '' || row.entity.signal2 != '')) return true;
                        return false;
                    }

                    $scope.colorCanslim = function(row, color) {
                        if ((row.entity.signal1 != '' || row.entity.signal2 != '')) {
                            if (row.entity.Canslim != '') {
                                if (color == 'purple') return true;
                                return false;
                            } else {
                                if (color == 'green') return true;
                                return false;
                            }
                        }
                        return false;
                    }

                    function align() {
                        $('.ui-grid-header-cell').each(function() {
                            var thisTag = $(this);
                            var span = thisTag.find('span');
                            if (span.text().indexOf('\n') < 0) {
                                span.parent().css('line-height', '40px');
                                thisTag.css('text-align', 'center');
                            } else {
                                span.last().css('margin-top', '-2px');
                            }
                        })
                    }
                })
            })
        })
    });