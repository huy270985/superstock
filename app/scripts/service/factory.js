"use strict";

angular
    .module('superstockApp')
    .factory('draw', function($firebaseArray) {
        var drawGrid = function(Ref, config, callback, event) {
            var data = $firebaseArray(Ref);
            data.$loaded(function() {
                var lstObj = [];
                for (var i in data) {
                    if (!isNaN(parseInt(i))) {
                        var obj = {};
                        if (config.idLabel)
                            obj[config.idLabel] = data[i].$id;
                        var arr = data[i].$value.split('|');
                        for (var j in config.labelList) {
                            obj[config.labelList[j]] = arr[j];
                        }
                        lstObj.push(obj);
                    } else break;
                }
                callback(lstObj);
                Ref.on('child_added', function(childSnapshot, prevChildKey) {
                    console.log('add');
                    var dataConvert = {};
                    if (config.idLabel)
                        dataConvert[config.idLabel] = childSnapshot.key;
                    var arr = childSnapshot.val().split('|');
                    for (var j in config.labelList) {
                        dataConvert[config.labelList[j]] = arr[j];
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
                        dataConvert[config.labelList[j]] = arr[j];
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