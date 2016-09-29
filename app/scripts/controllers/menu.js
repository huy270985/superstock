'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MenuCtrl', function ($rootScope, $scope, auth, $location, Ref, $firebaseObject) {
        $rootScope.user = null;
        $rootScope.link = '';
        var disconnectRef = null;
        var authDataSave = null;

        /**
         * Show filter controls
         */
        $scope.filterShow = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($rootScope.link == 'main') return;
            $("#wrapper").toggleClass("toggled");
        }

        /**
         * Redirect to home page
         */
        function redirect() {
            $location.path('/');
        }

        /**
         * Login with provider
         * Ex: facebook,...
         */
        $scope.oauthLogin = function (provider) {
            var providerData = getProviderData(provider);
            auth.$signInWithPopup(providerData)
                .then(function (authData) {
                    return createUserProfile(authData.user);
                }).then(function (userProfile) {
                    redirect();
                }).catch(function (error) {
                    console.log("login error");
                    console.log(error);
                })
        };

        /**
         * Logout ad redirect to hompage
         */
        $scope.logout = function () {
            // var obj = {};
            // obj[authDataSave.uid] = false;
            // disconnectRef.set(obj);
            auth.$signOut();
            if ($rootScope.$userRef)
                $rootScope.$userRef.$destroy();
            $location.path('/');
        };

        /**
         * Open popup to download superstock guide
         */
        $rootScope.openGuideModal = function ($event) {
            $event.preventDefault();
            $('#superStockGuideModal').modal('show');
        };

        /**
         * This function only use for development
         * active and deavtive account
         */
        $rootScope.activeDeactiveAccount = function (userID, $event) {
            $event.preventDefault();
            var $userRef;
            var promise = new Promise(function (resolve, reject) {
                var $user = $firebaseObject(Ref.child('users/' + userID));
                $userRef = $user;
                $user.$loaded(function (user) {
                    if (user && user.account) {
                        resolve(user);
                    } else {
                        reject();
                    }
                });
            })

            promise.then(function (user) {
                return new Promise(function (resolve, reject) {
                    var $user = Ref.child('users/' + userID);
                    var data = {
                        active: true
                    };
                    if (user.account.active) {
                        data.active = false;

                    }
                    if (data.active) {
                        var date = new Date();
                        date.setDate(date.getUTCDate() + 1);
                        data.expired_date = date.getFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate();
                    } else {
                        data.expired_date = '';
                    }
                    $user.child('account').set(data, function (err) {
                        if (err) {
                            reject();
                        } else {
                            $rootScope.user.account.active = data.active;
                            if (data.expired_date)
                                $rootScope.user.account.expired_date = new Date(data.expired_date);
                            resolve();
                        }
                    });
                });
            }).then(function () {
                $($event.target).parent().addClass('hidden');
                if ($userRef)
                    $userRef.$destroy();
            }).catch(function (e) {
                $($event.target).parent().addClass('hidden');
                if ($userRef)
                    $userRef.$destroy();
            });
        };

        /**
         * Create or update user profile when login
         */
        function createUserProfile(userData) {
            var user = userData.toJSON();
            return new Promise(function (resolve, reject) {
                var $user = $firebaseObject(Ref.child('users/' + user.uid));
                $rootScope.$userRef = $user;
                $user.$loaded(function (userProfile) {
                    if (userProfile) {
                        user.account = userProfile.account;
                        resolve(user);
                    } else {
                        resolve();
                    }
                });
            }).then(function (user) {
                return new Promise(function (resolve, reject) {
                    var $user = Ref.child('users/');
                    var child = user.uid;
                    var userProfile = {
                        profile: {
                            fullName: user.displayName,
                            email: user.email
                        },
                        account: {
                            active: false
                        }
                    };
                    if (user.providerData && user.providerData[0]) {
                        userProfile.profile.email = user.providerData[0].email;
                    }
                    if (user) {
                        if (user.account) {
                            $user = Ref.child('users/' + user.uid);
                            child = 'profile';
                            userProfile = userProfile.profile;
                        }

                    }

                    $user.child(child).set(userProfile, function (err) {
                        if (err) {
                            reject();
                        } else {
                            resolve(userProfile)
                        }
                    });
                })
            });
        }

        /**
         * Get provider data for login
         * Ex: facebook,...
         */
        function getProviderData(provider) {
            var providerData = provider;
            if (provider == 'facebook') {
                providerData = new firebase.auth['Facebook' + "AuthProvider"]();
                providerData.Lc.push('email');
            }
            return providerData;
        }
    })