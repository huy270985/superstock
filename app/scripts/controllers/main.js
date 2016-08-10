'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', function($scope, $firebaseArray, Ref, draw) {

        var data = $firebaseArray(Ref.child('shortterm_data').limitToLast(10));
        draw.drawGrid(data, {
            idLabel: 'Ma',
            labelList: ['A1', 'A2', 'A3', 'A4']
        }, function(data) {
            console.log(data);
            $scope.myData = data;
        });

        // function drawGrid(data, config, callback) {
        //     // config = {
        //     //     idLabel: '',
        //     //     labelList: ['', '']
        //     // }
        //     data.$loaded(function() {
        //         var lstObj = [];
        //         for (var i in data) {
        //             if (!isNaN(parseInt(i))) {
        //                 var obj = {};
        //                 if (config.idLabel)
        //                     obj[config.idLabel] = data[i].$id;
        //                 var arr = data[i].$value.split('|');
        //                 for (var j in config.labelList) {
        //                     obj[config.labelList[j]] = arr[j];
        //                 }
        //                 lstObj.push(obj);
        //             } else break;
        //         }
        //         callback(lstObj);
        //     })
        // }

    });