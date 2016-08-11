'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MãinCtrl
 * @description
 * # MãinCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FullStockCtrl', function($scope, $firebaseArray, $firebaseObject, Ref, draw) {
        $scope.gridOption = {};
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
                    var sizeArr = [
                        50, 200, 130, 130, 120, 150, 150, 110,
                        70, 230, 220, 200, 120, 170, 80, 130,
                        120, 120, 100, 100, 100, 70, 80, 90,
                        130, 150, 250, 60, 100, 90, 90, 150
                    ];
                    var columnDefs = [];
                    var config = {
                        idLabel: 'Mã',
                        labelList: []
                    }
                    for (var i in titlesArr) {
                        titlesArr[i] = titlesArr[i].replace('\n', '');
                        config.labelList.push(fieldsArr[i]);
                        columnDefs.push({
                            field: fieldsArr[i],
                            width: sizeArr[i],
                            displayName: titlesArr[i]
                        });
                    }
                    draw.drawGrid(Ref.child('superstock'), config, function(data) {
                        $scope.gridOption = {
                            minRowsToShow: 100,
                            columnDefs: columnDefs,
                            data: data
                        }
                        setTimeout(function() {
                            var heightOut = parseFloat($('.header').css('height')) + parseFloat($('.footer').css('height'));
                            var heightWin = $(document).height();
                            var heightHead = $('.ui-grid-header').height();
                            $('.header').next().height(heightWin - heightOut - 50);
                            $('.ui-grid-viewport').height(heightWin - heightOut - 50 - heightHead);
                        }, 200)

                    }, {
                        added: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOption.data) {
                                if ($scope.gridOption.data[i]['Mã'] == key) {
                                    data['A100'] = data['Mã'];
                                    $scope.gridOption.data[i] = data;
                                    return;
                                }
                            }
                            $scope.gridOption.data.push(data);
                        },
                        changed: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOption.data) {
                                if ($scope.gridOption.data[i]['Mã'] == key) {
                                    $scope.gridOption.data[i] = data;
                                    break;
                                }
                            }
                        },
                        removed: function(oldChildSnapshot) {
                            var key = oldChildSnapshot.key;
                            for (var i in $scope.gridOption.data) {
                                if ($scope.gridOption.data[i]['Mã'] == key) {
                                    $scope.gridOption.data.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    })
                })
            })
        });
    });