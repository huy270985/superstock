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
        $scope.filterShow = function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($rootScope.link == 'main') return;
            $("#wrapper").toggleClass("toggled");
        }
        var disconnectRef = null;
        var authDataSave = null;

        // $('#filter').click(function(e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     $("#wrapper").toggleClass("toggled");
        //     console.log('silder');
        // });

        // var timeUse = $firebaseObject(Ref.child('title'));
        // timeUse.$loaded(function(data) {
        //     console.log(data);
        //     $scope.timeUse = data.$value;
        // })

        function redirect() {
            $location.path('/');
        }

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
        $scope.logout = function () {
            // var obj = {};
            // obj[authDataSave.uid] = false;
            // disconnectRef.set(obj);
            auth.$signOut();
            $location.path('/');
        };

        $scope.openGuideModal = function ($event) {
            $event.preventDefault();
            $('#superStockGuideModal').modal('show');
        }

        auth.$onAuthStateChanged(function (authData) {

        });

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