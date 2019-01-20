'use strict';
angular
    .module('superstockApp')
    .factory('$tableRepository', ['$http', '$q', '$rootScope', 'auth', '$firebaseObject', 'Ref',
    function($http, $q, $rootScope, auth, $firebaseObject, Ref) {
        return {

            loadFullColSettings: function() {
                var deferred = $q.defer();
                var titles = $firebaseObject(Ref.child('superstock_titles'));
                var fields = $firebaseObject(Ref.child('superstock_headers'));
                var format = $firebaseObject(Ref.child('superstock_format'));
                $q.all([titles.$loaded(), fields.$loaded(), format.$loaded()])
                    .then(function(){
                        var titlesArr = titles.data.split('|');
                        var fieldsArr = fields.data.split('|');
                        var formatArr = format.data.split('|');

                        var widthObj = {"Mã": 90,
                            "industry": 220,
                            "close": 85,
                            "change": 85,
                            "acc_vol_change": 85,
                            "value": 140,
                            "short_signal": 120,
                            "eps": 85,
                            "eps_grow": 90,
                            "eps_grow_prev": 135,
                            "revenue_grow": 145,
                            "profit_grow": 135,
                            "power": 75,
                            "new_point": 75,
                            "basic": 75,
                            "capital_grow_3yr": 110,
                            "volume": 125,
                            "ma_v15": 120,
                            "ma_c30": 120,
                            "capital": 100,
                            "pe": 80,
                            "bv":120,
                            "roe":90,
                            "dividend":125,
                            "debt_capital_ratio":125,
                            "fx_effect":125,
                            "net_cash_flow":155,
                            "cut_loss":100,
                            "buy_date":150,
                            "buy_price":100,
                            "pnl":100,
                            "institution_holdings":90,
                            "hl_percent_T5":110,
                            "hl_percent_T20":110,
                            "max_close_30": 130,
                            "c4": 120,
                            "c1": 120,
                            "trend": 110,
                            "canslim": 100,
                            "sideway": 95,
                            "peak_T30": 130,
                            "recover_buy": 125,
                            "symbol": 80,
                            "disrupt_buy":125,
                        }
                        var colSettings = [];
                        for (var i in titlesArr) {
                            var colSetting = {
                                field: fieldsArr[i],
                                format: formatArr[i],
                                title: titlesArr[i],
                            }
                            var type = colSetting.format.split(':')[0];
                            colSetting.type = type
                            colSetting.isNumber = type === 'bigNum' || type === 'number' || type === 'percent';
                            colSetting.width = widthObj[colSetting.field];
                            colSettings.push(colSetting);
                        }
                        deferred.resolve(colSettings);
                    });
                return deferred.promise;
            },

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
                            var type = setting.format.split(":")[0];
                            colSettings[i] = Object.assign({
                                isNumber: type === 'bigNum' || type === 'number' || type === 'percent',
                                type: type,
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