'use strict';
angular
    .module('superstockApp')
    .factory('draw', function ($firebaseArray) {

        function convertSnapshot(config, key, value) {
            var dataConvert = {};
            if (config.idLabel)
                dataConvert[config.idLabel] = key;
            var arr = value.split('|');
            for (var j in config.labelList) {
                if (config.labelList[j].format.indexOf('percent') > -1) {
                    if (arr[j] == '')
                        dataConvert[config.labelList[j].fieldName] = '';
                    else
                        dataConvert[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                    if (isNaN(dataConvert[config.labelList[j].fieldName]))
                        dataConvert[config.labelList[j].fieldName] = '';
                } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                    dataConvert[config.labelList[j].fieldName] = parseFloat(arr[j]);
                    if (isNaN(dataConvert[config.labelList[j].fieldName]))
                        dataConvert[config.labelList[j].fieldName] = '';
                } else {
                    dataConvert[config.labelList[j].fieldName] = arr[j];
                }
            }
            return dataConvert;
        }

        function hidePaidUserData(obj) {
            var txt = "Bản thu phí";
            obj.signal1 = txt;
            obj.signal2 = txt;
            obj.symbol2 = txt;
            obj.Canslim = txt;
            obj.power = txt;
            obj.symbol = txt;
            return obj;
        }

        var drawGrid = function (isActive, Ref, config, loading, loaded, event) {
            var data = $firebaseArray(Ref);
            loading();
            data.$loaded(function () {
                /**
                 * $loaded & child event below might be duplicated.
                 * However $loaded is called even when there is 0 record
                 * Remove this will result in loading screen hang forever
                 */
                var objList = data.map(function(row) {
                    var obj = convertSnapshot(config, row.$id, row.$value);
                    if (!isActive) {
                        obj = hidePaidUserData(obj);
                    }
                    return obj;
                })
                loaded(objList);
            })
            .then(function() {
                //add new object event
                Ref.on('child_added', function (childSnapshot, prevChildKey) {
                    var obj = convertSnapshot(config, childSnapshot.key, childSnapshot.val())
                    if (!isActive) {
                        obj = hidePaidUserData(obj);
                    }
                    event.added(obj, childSnapshot, prevChildKey);
                });

                //update object event
                Ref.on('child_changed', function (childSnapshot, prevChildKey) {
                    var obj = convertSnapshot(config, childSnapshot.key, childSnapshot.val())
                    if (isActive) {
                        obj = hidePaidUserData(obj);
                    }
                    event.changed(obj, childSnapshot, prevChildKey);
                });

                //remove object event
                Ref.on('child_removed', function (oldChildSnapshot) {
                    event.removed(oldChildSnapshot);
                });
            })
            .then(function() {
                data.$watch(function (watchData) {
                    /**
                     * Since we're already bind added/changed/removed event, $watch is not needed.
                     * NOTE: always bind $watch after $loaded
                     */
                    // console.log('Firebase watch', watchData);
                    // //firebase data loading
                    // // loadingFlag is just to make sure $watch is binded after $loaded
                    // // can be deleted
                    // if (loadingFlag == false) return;
                    // if (data.length == 0) return;
                    // var popData = data[data.length - 1];
                    // var obj = convertSnapshot(config, popData.$id, popData.$value);
                    // loading(obj);
                    // lstObj.push(obj);
                });
            });
        }

        return {
            drawGrid: drawGrid
        }
    })