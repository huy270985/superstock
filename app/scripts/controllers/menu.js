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
            auth.$signInWithPopup(provider)
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
            $location.path('/');
        };

        /**
         * Open popup to download superstock guide
         */
        $rootScope.openGuideModal = function ($event) {
            $event.preventDefault();
            $('#superStockGuideModal').modal('show');
        }

        /**
         * Create or update user profile when login
         */
        function createUserProfile(user) {
            return new Promise(function (resolve, reject) {
                var $account = $firebaseObject(Ref.child('users/' + user.uid));
                $account.$loaded(function (userProfile) {
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
    })