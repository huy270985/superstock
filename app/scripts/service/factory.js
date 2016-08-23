'use strict';
angular
    .module('superstockApp')
    .factory('draw', function($firebaseArray) {
        var drawGrid = function(Ref, config, loading, loaded, event) {
            var data = $firebaseArray(Ref);
            var lstObj = [];
            var loadingFlag = true;
            data.$watch(function(watchData) {
                if (loadingFlag == false) return;
                if (data.length == 0) return;
                var popData = data[data.length - 1];
                var obj = {};
                if (config.idLabel)
                    obj[config.idLabel] = popData.$id;
                var arr = popData.$value.split('|');
                for (var j in config.labelList) {
                    // console.log(j);
                    if (config.labelList[j].format.indexOf('percent') > -1) {
                        obj[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                    } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                        obj[config.labelList[j].fieldName] = parseFloat(arr[j]);
                    } else {
                        obj[config.labelList[j].fieldName] = arr[j];
                    }

                }
                loading(obj);
                lstObj.push(obj);
            });
            data.$loaded(function() {
                loadingFlag = false;
                loaded(data);
                console.log('loaded');
                Ref.on('child_added', function(childSnapshot, prevChildKey) {
                    console.log('add');
                    var dataConvert = {};
                    if (config.idLabel)
                        dataConvert[config.idLabel] = childSnapshot.key;
                    var arr = childSnapshot.val().split('|');
                    for (var j in config.labelList) {
                        if (config.labelList[j].format.indexOf('percent') > -1) {
                            dataConvert[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                        } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                            dataConvert[config.labelList[j].fieldName] = parseFloat(arr[j]);
                        } else {
                            dataConvert[config.labelList[j].fieldName] = arr[j];
                        }
                    }
                    event.added(dataConvert, childSnapshot, prevChildKey);
                });

                Ref.on('child_changed', function(childSnapshot, prevChildKey) {
                    console.log('change');
                    var dataConvert = {};
                    if (config.idLabel)
                        dataConvert[config.idLabel] = childSnapshot.key;
                    var arr = childSnapshot.val().split('|');
                    for (var j in config.labelList) {
                        if (config.labelList[j].format.indexOf('percent') > -1) {
                            dataConvert[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                        } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                            dataConvert[config.labelList[j].fieldName] = parseFloat(arr[j]);
                        } else {
                            dataConvert[config.labelList[j].fieldName] = arr[j];
                        }
                    }
                    event.changed(dataConvert, childSnapshot, prevChildKey);
                });

                Ref.on('child_removed', function(oldChildSnapshot) {
                    console.log('remove');
                    event.removed(oldChildSnapshot);
                });
            })
        }


        return {
            drawGrid: drawGrid
        }
    })