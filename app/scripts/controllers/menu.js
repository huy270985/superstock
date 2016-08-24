'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MenuCtrl', function($rootScope, $scope, auth, $location, Ref, $firebaseObject) {
        $rootScope.user = null;
        $rootScope.link = '';
        $scope.filterShow = function(e) {
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

        var timeUse = $firebaseObject(Ref.child('title'));
        timeUse.$loaded(function(data) {
            $scope.timeUse = data.$value;
        })

        function redirect() {
            $location.path('/');
        }

        $scope.oauthLogin = function(provider) {
            auth.$signInWithPopup(provider)
                .then(function(authData) {
                    // var user = $firebaseObject(Ref.child('user_settings'));
                    // console.log("logged");
                    // console.log(authData);
                    // user[authData.uid] = {};
                    // var obj = {};
                    // obj[authData.uid] = true;
                    // disconnectRef.set(obj);
                    // disconnectRef = firebase.database().ref('title');
                    // disconnectRef.set('test');
                    // console.log(disconnectRef);
                    // disconnectRef.on('value', function(data) {
                    //     console.log(data)
                    // });
                    redirect();
                })
                .catch(function(error) {
                    console.log("login error");
                    console.log(error);
                })
        };
        $scope.logout = function() {
            // var obj = {};
            // obj[authDataSave.uid] = false;
            // disconnectRef.set(obj);
            auth.$signOut();
            $location.path('/');
        };

        // Ref.onDisconnect(function() {
        //     var userOnline = $firebaseObject(Ref.child('users'));
        //     userOnline.$set('online', true);
        //     userOnline.$save();
        // });
        // console.log(Ref);
        // var presenceRef = Ref.child('users').child('online');
        // presenceRef.on("value", function(snap) {
        //     if (snap.val()) {
        //         // Remove ourselves when we disconnect.
        //         userRef.onDisconnect().remove();

        //         userRef.$set(true);
        //         userRef.$save();
        //     }
        // });
        // var disconnectRef = firebase.database().ref('users');
        // disconnectRef.onDisconnect().set({
        //     'aaa': {
        //         online: true
        //     }
        // });
        auth.$onAuthStateChanged(function(authData) {
            // console.log(authData);
            // authDataSave = authData;
            // if (authData) {
            //     disconnectRef = firebase.database().ref('title');
            //     var obj = {};
            //     obj[authData.uid] = true;
            //     disconnectRef.set(obj);
            //     obj[authData.uid] = false;
            //     disconnectRef.onDisconnect().set(obj);
            // } else {

            // }
        });
    })