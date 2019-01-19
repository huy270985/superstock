'use strict';
angular
    .module('superstockApp')
    .factory('$tableRepository', ['$http', '$q', '$rootScope', 'auth', '$firebaseObject', 'Ref',
    function($http, $q, $rootScope, auth, $firebaseObject, Ref) {
        return {

            loadColSettings: function(uid, name) {
                var deferred = $q.defer();
                var titles = $firebaseObject(Ref.child('summary_titles'));
                var fields = $firebaseObject(Ref.child('summary_headers'));
                var format = $firebaseObject(Ref.child('summary_format'));
                var userTableSettings = $firebaseObject(Ref.child('users/' + uid + '/tableSettings/' + name));

                $q.all([titles.$loaded(), fields.$loaded(), format.$loaded(), userTableSettings.$loaded()])
                    .then(function(){
                        if (!titles.data || !fields.data || !format.data) {
                            throw new Error("One or all format data could not be loaded from server, check your firebase realtime database");
                        }
                        var titlesArr = titles.data.split('|');
                        var fieldsArr = fields.data.split('|');
                        var formatArr = format.data.split('|');

                        // Define size of field in client
                        //"symbol|matchPrice|priceChange|totalValue|volumeChange|EPS|newPoint|Canslim|pricePeak|signal1|symbol2"
                        var defaultTableSettings = {
                            symbol: { width: 90},
                            matchPrice: { width: 100},
                            priceChange: { width: 100},
                            totalValue: { width: 125},
                            volumeChange: { width: 95},
                            EPS: { width: 65},
                            newPoint: { width: 75},
                            power: { width: 75},
                            Canslim: { width: 105},
                            pricePeak: { width: 100},
                            signal1: { width: 130},
                            symbol2: { width: 75},
                            signal2: { width: 130},
                        }

                        // merge defaultTableSettings & userTableSettings
                        for (var i in titlesArr) {
                            var userSetting = userTableSettings[fieldsArr[i]] || {};
                            var defaultSetting = defaultTableSettings[fieldsArr[i]] || {width: 90};
                            userTableSettings[fieldsArr[i]] = Object.assign(
                                userSetting,
                                defaultSetting,
                                {
                                    field: fieldsArr[i],
                                    title: titlesArr[i],
                                    format: formatArr[i],
                                }
                            );
                        }

                        var colSettings = []
                        for (var i in titlesArr) {
                            var field = fieldsArr[i];
                            var setting = userTableSettings[field];
                            // crazy closure handling
                            var isType = (function(format) {
                                    return function(type) {
                                        return format.indexOf(type) > -1
                                    }
                                })(setting.format);

                            colSettings[i] = Object.assign({
                                isType: isType,
                                isNumber: isType('bigNum') || isType('number') || isType('percent'),
                            }, setting);
                        }

                        deferred.resolve(colSettings);
                    });
                return deferred.promise;
            },

            saveColSetting: function(uid, name, field, value) {
                var userTableSettings = $firebaseObject(Ref.child('users/' + uid + '/tableSettings/' + name + '/' + field))
                userTableSettings = Object.assign(userTableSettings, value);
                userTableSettings.$save();
            }

        }
    }])