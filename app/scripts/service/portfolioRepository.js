'use strict';
/**
 * @description
 * Saving user personal portfolio
 */
angular
    .module('superstockApp')
    .factory('$portfolioRepository', ['$http', '$q', '$rootScope', 'auth', '$firebaseObject', 'Ref',
        function ($http, $q, $rootScope, auth, $firebaseObject, Ref) {
            /**
             * Clean the data before saving to firebase
             * firebase data can be null or a value, not undefined
             * https://stackoverflow.com/questions/34708566/firebase-update-failed-first-argument-contains-undefined-in-property
             * @param {data to save to firebase} record
             */
            function clean(record) {
                var res = {};
                function _isValueClean(value) {
                    if (typeof (record[key]) === "number") {
                        if (!isNaN(record[key])) {
                            return true;
                        }
                    }
                    else {
                        if (record[key] !== undefined) {
                            return true;
                        }
                    }
                    return false;
                }
                for (var key in record) {
                    if (_isValueClean(record[key])) {
                        res[key] = record[key];
                    }
                }
                return res;
            }
            return {
                /**
                 * One portfolio may have multiple entries with the same symbol
                 * @param {one portfolio entry, index by .id attribute} record
                 */
                saveEntry: function (uid, record) {
                    if (!record.id) { return; }
                    var $entry = $firebaseObject(Ref.child('users/' + uid + '/portfolio/data/' + record.id));
                    $entry.$value = clean(record);
                    $entry.$save()
                        .then(function () {
                            console.debug("$portfolioRepository: Save portfolio entry success", { uid: uid, $entry: $entry});
                        },
                        function (error) {
                            console.error("$portfolioRepository: Save entry failed uid with error", uid, error);
                        })
                },

                deleteEntry: function (uid, recordId) {
                    if (!recordId || !uid) { return; }
                    var deferred = $q.defer();
                    var $entry = $firebaseObject(Ref.child('users/' + uid + '/portfolio/data/' + recordId));
                    $entry.$remove()
                        .then(function () {
                            console.debug("$portfolioRepository: Delete entry success", { uid: uid, $entry: $entry });
                            deferred.resolve();
                        },
                        function (error) {
                            console.error("$portfolioRepository: Delete entry failed", { uid: uid, error: error });
                            deferred.reject();
                        })
                    return deferred.promise;
                },

                /**
                 * Return a list of user current porfolio entry
                 */
                loadAll: function (uid) {
                    var deferred = $q.defer();
                    var $portfolio = $firebaseObject(Ref.child('users/' + uid + '/portfolio'));
                    $portfolio.$loaded()
                        .then(function (data) {
                            console.log("Data loaded", $portfolio);
                            data = data.data;  // avoiding $$ property
                            if (!data) {
                                deferred.resolve([]);
                                return;
                            }
                            var res = Object.keys(data).map(function (id) {
                                return data[id];
                            });
                            deferred.resolve(res);
                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });
                    return deferred.promise;
                },
            }
        }]);