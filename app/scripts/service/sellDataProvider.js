'use strict';
angular
    .module('superstockApp')
    .factory('sellDataProvider', [
        '$firebaseObject', 'Ref', '$q',
        function ($firebaseObject, Ref, $q) {
            return {
                load: function (handler) {
                    var symbols = ['AAA', 'BBB']
                    var sMap = {}
                    for (var i in symbols) {
                        // this helps us know when to update the table
                        sMap[symbols[i]] = $firebaseObject(Ref.child('sell_signals/' + symbols[i]));
                        sMap[symbols[i]].$watch(function (event) {
                            // we must create a whole object data here
                            console.log("Data changed", event, sMap[event.key]);
                            if (sMap[event.key].data) {
                                var snapshot = sMap[event.key].data
                                snapshot.symbol = event.key
                                handler['changed'] && handler['changed'](event.key, snapshot)
                            }
                            else { // this is the only way we know the node itself is destroyed
                                console.log('The node it self is destroyed', event.key)
                            }
                        })

                        // this provide binding, so updating $scope will push change to database
                        // $firebaseObject(Ref.child('sell_signals/' + symbols[i])).$bindTo($scope, 'data.' + symbols[i]).then(function () {
                        //     console.log('Changed', $scope.data);
                        // });

                    }

                }
            }
        }
    ])
