'use strict';

angular
    .module('superstockApp')
    .factory('utils', ['$http', '$q', '$rootScope', '$timeout', '$firebaseObject', 'Ref',
        function ($http, $q, $rootScope, $timeout, $firebaseObject, Ref) {

            const URL = 'https://price-sync-227313.firebaseio.com';

            var timeoutPromise;

            return {

                debounce: function(func, time) {
                    if (timeoutPromise != undefined) {
                        $timeout.cancel(timeoutPromise);
                    }
                    timeoutPromise = $timeout(function() {
                        func();
                        timeoutPromise = undefined;
                    }, time)
                },

                getCellClass: function (params, format, selectedSyle) {
                    var field = params.colDef.field;
                    var value = params.value;
                    var classList = [];
                    if (selectedSyle && selectedSyle != '' && field != 'symbol')
                        classList.push('ag-cell-focus-bg');

                    if (format[field].indexOf('number') > -1 || format[field].indexOf('percent') > -1 || format[field].indexOf('bigNum') > -1)
                        classList.push('ui-cell-align-right');
                    if (params.value && format[field].indexOf('percent') > -1)
                        classList.push('percent');
                    switch (field) {
                        case 'priceChange':
                            if (value < 0) classList.push("grid-cell-red");
                            else classList.push("grid-cell-green");
                            break;
                        case 'EPS':
                            if (value < 1000) classList.push("grid-cell-red");
                            else classList.push("grid-cell-green");
                            break;
                        case 'revenueChange':
                        case 'EPSChange':
                        case 'profitChange':
                            if (value < 0) classList.push("grid-cell-red");
                            else classList.push("grid-cell-green");
                            break;
                        case 'point':
                            if (value < 5) classList.push("grid-cell-red");
                            else if (value >= 5 && value < 7) classList.push("grid-cell-green");
                            else classList.push('grid-cell-purple');
                            break;
                        case 'roe':
                            if (value < 10) classList.push("grid-cell-red");
                            if (value > 20) classList.push('grid-cell-purple');
                            else classList.push("grid-cell-green");
                            break;
                        case 'fxEffect':
                        case 'cashFlow':
                            if (value < 0) classList.push("grid-cell-red");
                            else if (value > 0) classList.push("grid-cell-green");
                            break;
                    }
                    return classList;
                },
                getCellClassSummary: function (params, colSetting, selectedSyle) {
                    /**
                     * Define cell style for grid by column
                     */


                    var field = params.colDef.field;
                    var value = params.value;
                    var data = params.data;

                    /**
                    Util to determine if a strong is truely strong
                    */
                    function is_strong_stock(stock) {
                        return stock.EPS >= 3000 && stock.newPoint >= 6;
                    }

                    var classList = [];
                    if (selectedSyle && selectedSyle != '' && field != 'symbol')
                        classList.push('ag-cell-focus-bg');

                    if (colSetting.isNumber)
                        classList.push('ui-cell-align-right');
                    if (params.value && colSetting.isType && colSetting.isType('percent'))
                        classList.push('percent');
                    switch (field) {
                        case 'roe':
                            if (value < 10) classList.push("grid-cell-red");
                            if (value > 20) {
                                classList.push('grid-cell-purple');
                                classList.push('ag-cell-fill-bg');
                            }
                            else classList.push("grid-cell-green");
                            break;
                        case 'symbol':
                            /**
                            * When this field has value
                            * - Background color will be filled
                            * When signal1 or signal 2 have value
                            * - if Canslim has data forceground color will be purple
                            * and otherwise it is green
                            */
                            if (value != '') {
                                if ((params.data.signal1 != '' || params.data.signal2 != '')) {
                                    // In case we want to be purple again
                                    // if (params.data.Canslim != '' && is_strong_stock(params.data)) {
                                    //     classList.push('ag-cell-purple-color');
                                    // } else {
                                    //     classList.push('grid-cell-green');
                                    // }
                                    classList.push('grid-cell-green');
                                    classList.push('ag-cell-fill-bg');
                                }
                            }
                            break;
                        case 'industry':
                            /**
                             * Fix for industry
                             * industry is data which is a total value from server
                             */
                            if (value >= 5e9 && $rootScope.link == 'main') {
                                classList.push('ag-cell-purple-color');
                                classList.push('ag-cell-fill-bg');
                            }
                            break;
                        case 'totalValue':
                            /**
                            * When this field has value and greater than 5.000.000.000
                            * background and forceground(purple) will be filled and
                            */
                            if (value >= 20e9) {
                                classList.push('ag-cell-purple-color');
                                classList.push('ag-cell-fill-bg');
                            }
                            break;
                        case 'EPS':
                            /**
                            * When this field has value and
                            * >= 3000, background and forceground(purple) will be filled
                            * > 1000, forceground(green) will be filled
                            * < 1000, forceground(red) will be filled
                            */
                            if (value >= 3000) {
                                classList.push('ag-cell-purple-color');
                                classList.push('ag-cell-fill-bg');
                            } else if (value > 1000) {
                                classList.push('grid-cell-green');
                            } else if (value < 1000) {
                                classList.push('grid-cell-red');
                            }
                            break;
                        case 'oldPoint':
                            /**
                             * oldPoint is actually TT EPS cung ky now?
                             */
                            if (value >= 30) {
                                classList.push('ag-cell-fill-bg');
                                classList.push('ag-cell-purple-color');
                            }
                            break;
                        case 'newPoint':
                            /**
                            * When this field has value and
                            * >= 7, background and forceground(purple) will be filled
                            * >= 5, forceground(green) will be filled
                            * <= 4, forceground(red) will be filled
                            */
                            if (value >= 7) {
                                classList.push('ag-cell-purple-color');
                                classList.push('ag-cell-fill-bg');
                            } else if (value > 5) {
                                classList.push('grid-cell-green');
                            } else if (value == 5) {
                                classList.push('grid-cell-black');
                            } else if (value <= 4) {
                                classList.push('grid-cell-red');
                            }
                            classList.push('text-center');
                            break;
                        case 'power':
                            if (value >= 9) {
                                classList.push('ag-cell-purple-color');
                                classList.push('ag-cell-fill-bg');
                            } else if (value >= 7) {
                                classList.push('grid-cell-green');
                            } else {
                                classList.push('grid-cell-black');
                            }
                            classList.push('text-center');
                            break;
                        case 'Canslim':
                        // case 'pricePeak':
                            /**
                            * When this field has value
                            * background and forceground(purple) will be filled
                            */
                            if (value != '') {
                                classList.push('ag-cell-fill-bg');
                                if (value == '..Rủi ro')
                                    classList.push('grid-cell-red');
                                else
                                    classList.push('ag-cell-purple-color');
                            } else {

                            }
                            classList.push('text-center');
                            break;

                        case 'symbol2':
                            /**
                            * When this field has value
                            * - Background color will be filled
                            * When signal1 or signal 2 have value
                            * - if Canslim has data forceground color will be purple
                            * and otherwise it is green
                            */
                            if (value != '') {
                                if ((params.data.signal1 != '' || params.data.signal2 != '')) {
                                    /**
                                    Only make strong symbol purple
                                    By Hung's request: 2017-06-12

                                    Keeping in case we want purple again
                                    */
                                    // if (params.data.Canslim != '' && is_strong_stock(params.data)) {
                                    //     classList.push('ag-cell-purple-color');
                                    // } else {
                                    //     classList.push('grid-cell-green');
                                    // }
                                    classList.push('grid-cell-green')
                                    classList.push('ag-cell-fill-bg');
                                }
                            }
                            // classList.push('ag-cell-green-bg');
                            classList.push('text-center');
                            break;

                        case 'signal1':
                        case 'signal2':
                            /**
                            * When this field has value
                            * background and forceground(purple) will be filled
                            * and otherwise background is green
                            */
                            if (value != '') {
                                /**
                                Only make strong symbol purple
                                By Hung's request: 2017-06-12

                                Turn off purple
                                By Hung's request: 2017-01-11
                                */
                                // if (is_strong_stock(params.data)) {
                                //     classList.push('ag-cell-purple-color');
                                // }
                                // else{
                                //     classList.push('grid-cell-green');
                                // }
                                classList.push('grid-cell-green');
                                if (value == 'Điểm chú ý') {
                                    classList.push('ag-cell-fill-bg-yellow');
                                }
                                else {
                                    classList.push('ag-cell-fill-bg');
                                }
                            }
                            // classList.push('ag-cell-green-bg');
                            classList.push('text-center');
                            break;

                        case 'sellSignal':
                            /**
                             * Fill red background for cell which is sell signal
                             */
                            classList.push('ag-cell-red-bg');
                            classList.push('text-center');
                            break;
                        case 'volumeChange':
                            /**
                             * Fix for volumeChange
                             * volumeChange is data which is a total value from server
                             */
                            if (value >= 30 && $rootScope.link == 'main') {
                                classList.push('ag-cell-purple-color');
                                classList.push('ag-cell-fill-bg');
                            }
                            break;
                        case 'pnl':
                        case 'pnlValue':
                            value > 0 ? classList.push('grid-cell-green') : classList.push('grid-cell-red');
                            break;
                        case 'cutLoss':
                        case 'two_down':
                        case 'min_T10':
                        case 'take_profit':
                            value >= data.close && classList.push('ag-cell-red-bg');
                            break;

                    }
                    return classList;
                },

                getMarketSummary: function () {
                    /*
                    * Get sell signals data
                    */
                    var deferred = $q.defer();
                    var result = {};
                    $http.get('https://price-sync-227313.firebaseio.com/market_summary.json', {}).then(function (data) {
                        if (data && data.data) {
                            var rs = data.data;
                            var result = {
                                color: rs.color,
                                content: data.data.data ? data.data.data.content : '',
                                timestamp: data.data,
                            }
                            result.content = result.content.replace('\n', '<br />');
                            var pattern = /(HTTP:\/\/.*)\b/
                            var addr = result.content.match(pattern)
                            if (addr && addr.length == 2) {
                                addr = addr[0].trim()
                                result.content = result.content.replace(pattern, '<a target="_blank" href="' + addr + '">LINK</a>');
                            }
                            deferred.resolve(result);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },

                getTradingDate: function () {
                    var deferred = $q.defer();
                    $http.get(URL + '/trading_date/data.json', {}).then(function (data) {
                        if (data && data.data) {
                            deferred.resolve(data.data);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },

                watchSellSymbols: function(func) {
                    var sellSymbols = $firebaseObject(Ref.child('sell_symbols'));
                    sellSymbols.$watch(function() {
                        func(sellSymbols.data.split("|"));
                    });
                },

                getCompanyInformation: function (id) {
                    /*
                    * Get company profile data from Firebase
                    */
                    var deferred = $q.defer();
                    var result = [];
                    $http.get('https://price-sync-227313.firebaseio.com/profile/' + id + '.json', {}).then(function (data) {
                        if (data && data.data && data.data.data) {
                            if (data && data.data && data.data.data) {
                                var rs = data.data.data;
                                result = rs;
                            }
                            deferred.resolve(result);
                        }
                    }, function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                writeData2Worksheet: function (data, config) {
                    /**
                     * Write data to worksheet
                     */
                    return new Promise(function (resolve, reject) {
                        //Get template from server /* set up XMLHttpRequest */
                        var url = "data/template.xlsx";
                        var oReq = new XMLHttpRequest();
                        oReq.open("GET", url, true);
                        oReq.responseType = "arraybuffer";

                        oReq.onload = function (e) {
                            var arraybuffer = oReq.response;

                            /* convert data to binary string */
                            var data = new Uint8Array(arraybuffer);
                            var arr = new Array();
                            for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
                            var bstr = arr.join("");

                            /* Call XLSX */
                            var workBook = XLSX.read(bstr, { type: "binary", cellStyles: true });

                            resolve(workBook);
                        }

                        oReq.send();
                    }).then(function (workBook) {
                        return new Promise(function (resolve, reject) {
                            var workSheet = workBook.Sheets[workBook.SheetNames[0]];
                            var row = 4;
                            for (var i in data) {
                                var forSymbol2 = 0;
                                for (var j in data[i]) {
                                    var key = j;
                                    if (j == 'symbol2') {
                                        key = key + forSymbol2;
                                        forSymbol2++;
                                    }
                                    if (config[key]) {
                                        var cell = config[key].cell;
                                        if (cell) {
                                            var cellAddress = cell + (row + parseInt(i));
                                            var cellData = workSheet[cellAddress];
                                            if (!cellData)
                                                cellData = {};
                                            cellData.v = data[i][j];
                                            if (config[key].format.indexOf('number') > -1 || config[key].format.indexOf('bigNum') > -1) {
                                                cellData.t = 'n';
                                                cellData.z = '#,###';
                                                if (!cellData.v || cellData.v == null || cellData.v == '')
                                                    cellData.v = 0;
                                                if (cellData.v == 0)
                                                    delete cellData.z;
                                            }
                                            if (config[key].format.indexOf('percent') > -1) {
                                                cellData.t = 'n';
                                                var value = parseFloat(cellData.v);
                                                if (!isNaN(value)) {
                                                    value = (value / 100).toFixed(4);
                                                    cellData.v = value;
                                                    // value = value.toFixed(2); // uncomment this if we want % display in Excel
                                                    // cellData.v = value + '%';
                                                } else {
                                                    cellData.v = '';
                                                }
                                            }
                                            if (config[key].format == '')
                                                cellData.t = 's';
                                            workSheet[cellAddress] = cellData;
                                            if (j == 'symbol2') {
                                                if (config[j + forSymbol2]) {
                                                    var cellAddress = config[j + forSymbol2].cell + (row + parseInt(i));
                                                    var cellData = workSheet[cellAddress];
                                                    cellData.v = data[i][j];
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            resolve(workBook);
                        });
                    }).catch(function (ex) {
                        return ex;
                    })

                },
                generateWorksheetFile: function (workBook, callback) {
                    /**
                     * Generate EXCEL file
                     */
                    // Config generate file
                    var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary', cellStyles: true };

                    // Write data to file
                    var wbout = XLSX.write(workBook, wopts);


                    function s2ab(s) {
                        var buf = new ArrayBuffer(s.length);
                        var view = new Uint8Array(buf);
                        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                        return buf;
                    }

                    // The saveAs call downloads a file on the local machine
                    var date = new Date();
                    var fileName = 'SuperStock' + date.getFullYear() + '' + (date.getUTCMonth() + 1) + '' + date.getUTCDate() + '.xlsx';
                    saveAs(new Blob([s2ab(wbout)], { type: "" }), fileName);
                    if (callback)
                        callback();
                },
            }
        }]);