'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', function($rootScope, $scope, $firebaseArray, $firebaseObject, Ref, draw, utils, $window) {
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
                        70, '*', 200, 80, 80, 70, 100, 80, 80, 80
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
                        columnDefs.push(def);
                    }
                    $rootScope.filters = columnDefs;
                    $scope.gridOptions.columnDefs = columnDefs;
                    draw.drawGrid(Ref.child('summary_data'), config, function(data) {
                        $scope.gridOptions.data.push(data);
                    }, function(data) {

                        console.log($scope.gridOptions.data);
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
        })
    });