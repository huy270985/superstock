'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', ['$rootScope', '$scope', 'auth',
        'Ref', 'dataProvider', '$window',
        'tableSettings', '$tableRepository', '$table', 'common',
        function ($rootScope, $scope, auth,
            Ref, dataProvider, $window,
            tableSettings, $tableRepository, $table, common) {
            $rootScope.link = tableSettings.name;
            $window.ga('send', 'pageview', "Tổng hợp");
            var uid = auth.$getAuth().uid;

            common.syncMarketSummary($scope);
            common.syncTradingDate($scope);
            common.clickSymbolPopupDetails($scope);

            const table = $table.create($rootScope, $scope, tableSettings, uid);

            $tableRepository.loadColSettings(uid, tableSettings.name).then(function (colSettings) {
                table.setColSettings(colSettings);
                dataProvider.load(
                    $rootScope.user.account.active,
                    Ref.child(tableSettings.gridDataSource),
                    table.getHeaderConfig(colSettings),
                    function loading() {
                        table.loading();
                    },

                    function loaded(data) {
                        table.loaded(data);
                    },

                    {
                        added: function (data, childSnapshot, id) {
                            table.added(childSnapshot.key, data);
                        },
                        changed: function (data, childSnapshot, id) {
                            table.changed(childSnapshot.key, data);
                        },
                        removed: function (oldSnapshot) {
                            table.remove(oldSnapshot.key);
                        }
                    }
                );

            });

        }]);