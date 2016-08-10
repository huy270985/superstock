angular
    .module('superstockApp')
    .factory('draw', function() {
        var drawGrid = function(data, config, callback) {
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
            })
        }
        return {
            drawGrid: drawGrid
        }
    })