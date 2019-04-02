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
            $table.createSellSymbolTable('grid-market-options');

            $tableRepository.loadColSettings(uid, tableSettings.name).then(function (colSettings) {
                table.setColSettings(colSettings);
                console.log('ColSettings', colSettings);
                dataProvider.load(
                    $rootScope.user.account.active,
                    Ref.child(tableSettings.gridDataSource),
                    table.getHeaderConfig(colSettings),
                    function loading() {
                        table.loading();
                    },

                    function loaded(data) {
                        console.debug("main.js - table data loaded", data);
                        table.loaded(data);
                    },

                    {
                        added: function (data, childSnapshot, id) {
                            console.debug("main.js - table data added", childSnapshot.key, data);
                            table.added(childSnapshot.key, data);
                        },
                        changed: function (data, childSnapshot, id) {
                            console.debug("main.js - table data changed", childSnapshot.key, data);
                            table.changed(childSnapshot.key, data);
                        },
                        removed: function (oldSnapshot) {
                            console.debug("main.js - table data removed", childSnapshot.key, data);
                            table.removed(oldSnapshot.key);
                        }
                    }
                );

            });

        }]);