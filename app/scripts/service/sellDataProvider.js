'use strict';
angular
    .module('superstockApp')
    .factory('sellDataProvider', [
        '$firebaseObject', 'Ref', '$q',
        function ($firebaseObject, Ref, $q) {

            /**
             * Unwatch dict of $firebaseObject
             */
            var subscribed = {};
            return {
                /**
                 * Watching list of symbol for changes of sell signal
                 * Will unwatch previous call
                 * @param {list of string} symbols
                 * @param {{'changed': func()}} handler
                 */
                watch: function (handler, symbols) {
                    // unsubscribe previous symbol
                    for (var symbol in subscribed) {
                        subscribed[symbol].unwatch();
                        console.debug("Unsubscribed ", symbol);
                        handler['removed'] && handler['removed'](symbol)
                    }
                    subscribed = {};
                    for (var i in symbols) {
                        var symbol = symbols[i];

                        var unwatch = function watch(symbol) {
                            subscribed[symbol] = {};
                            var obj = $firebaseObject(Ref.child('sell_signals/' + symbol));
                            return obj.$watch(function (event) {
                                console.log("Data changed", event, obj, unwatch);
                                if (obj.data) {
                                    var snapshot = obj.data
                                    snapshot.symbol = event.key
                                    handler['changed'] && handler['changed'](event.key, snapshot)
                                }
                                else { // this is the only way we know the node itself is destroyed
                                    console.log('The node it self is destroyed', event.key)
                                }
                            });
                        }(symbol);

                        if (unwatch != undefined) {
                            subscribed[symbol].unwatch = unwatch;
                        }
                    }
                },

                /**
                 * similar to watch() but only target 1 symbol
                 * @param {{'changed': func(key, data)}} handler
                 * @param {string: symbol to subscribe} symbol
                 */
                subscribe: function (handler, symbol) {
                    subscribed[symbol] && subscribed[symbol].unwatch();
                    var obj = $firebaseObject(Ref.child('sell_signals/' + symbol));
                    var unwatch = obj.$watch(function (event) {
                        var snapshot = obj.data;
                        snapshot.symbol = event.key;
                        handler['changed'] && handler['changed'](event.key, snapshot);
                    });
                    subscribed[symbol] = { unwatch: unwatch };
                },

                unsubscribe: function (symbol) {
                    subscribed[symbol] && subscribed[symbol].unwatch();
                    delete subscribed[symbol];
                },

                colSettings: function () {
                    /**
                     * List of columns to display, we store it here so it's easier to migrate
                     * No more dependency on Firebase
                     */
                    return [
                        {
                            field: "symbol",
                            format: "",
                            isNumber: false,
                            title: "Mã",
                            type: "",
                            width: 120,
                            editable: true,
                        },
                        {
                            field: "quantity",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "KL",
                            type: "number",
                            width: 100,
                            editable: true,
                        },
                        {
                            field: "costPrice",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Giá vốn",
                            type: "number",
                            width: 100,
                            editable: true,
                        },
                        {
                            field: "close",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Giá",
                            type: "number",
                            width: 100,
                        },

                        {
                            field: "pnl",
                            format: "percent:3:3:280",
                            isNumber: true,
                            title: "Lỗ lãi",
                            type: "percent",
                            width: 100,
                        },
                        {
                            field: "cutLoss",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Bán \ncắt lỗ",
                            type: "number",
                            width: 100,
                        },
                        {
                            field: "take_profit",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Bán \nchặn lãi",
                            type: "number",
                            width: 100,
                        },
                        {
                            field: "two_down",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Giảm \nliên tục",
                            type: "number",
                            width: 100,
                        },
                        {
                            field: "broken_trend",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Gãy trend",
                            type: "number",
                            width: 100,
                        },
                        {
                            field: "delete",
                            width: 20,
                        }
                    ];

                }

            }
        }
    ])
