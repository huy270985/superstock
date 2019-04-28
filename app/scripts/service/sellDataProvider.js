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
                 * similar to watch() but only target 1 symbol
                 * @param {{'changed': func(key, data)}} handler
                 * @param {string: symbol to subscribe} symbol
                 */
                subscribe: function (handler, symbol) {
                    subscribed[symbol] && subscribed[symbol].unwatch();
                    var obj = $firebaseObject(Ref.child('sell_signals/' + symbol));
                    var unwatch = obj.$watch(function (event) {
                        var snapshot = obj.data;
                        if (!snapshot) {
                            return;
                        }
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
                            width: 80,
                            editable: true,
                        },
                        {
                            field: "quantity",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "KL",
                            type: "number",
                            width: 70,
                            editable: true,
                        },
                        {
                            field: "costPrice",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Giá \nvốn",
                            type: "number",
                            width: 70,
                            editable: true,
                        },
                        {
                            field: "close",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Giá \nthị trường",
                            type: "number",
                            width: 100,
                        },
                        {
                            field: "totalCost",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Tổng \ngiá vốn",
                            type: "bigNum",
                            width: 90,
                        },
                        {
                            field: "totalValue",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Tổng \nthị giá",
                            type: "bigNum",
                            width: 90,
                        },

                        {
                            field: "pnlValue",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Lãi/Lỗ",
                            type: "bigNum",
                            width: 100,
                        },
                        {
                            field: "pnl",
                            format: "percent:3:3:280",
                            isNumber: true,
                            title: "% \nLãi/Lỗ",
                            type: "percent",
                            width: 90,
                        },
                        {
                            field: "weight",
                            format: "percent:3:3:280",
                            isNumber: true,
                            title: "% \nPhân bổ",
                            type: "percent",
                            width: 90,
                        },
                        {
                            field: "cutLoss",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Bán \ncắt lỗ",
                            type: "number",
                            width: 90,
                        },
                        {
                            field: "take_profit",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Bán \nchặn lãi",
                            type: "number",
                            width: 80,
                        },
                        {
                            field: "two_down",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Giảm \n2 nến đỏ",
                            type: "number",
                            width: 80,
                        },
                        {
                            field: "min_T10",
                            format: "number:3:3:280",
                            isNumber: true,
                            title: "Thấp nhất\n4 phiên",
                            type: "number",
                            width: 90,
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
