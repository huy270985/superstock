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

        $scope.userSignin = {};
        $scope.userSignup = {};
        $scope.checkEmail;
        $scope.checkPassword;
        $scope.checkSignIn = true;
        $scope.checkConfirmPassword;
        $scope.checkFullName;
        $scope.disabledButton;
        $scope.loading = false;

        /**
         * Login with provider
         * Ex: facebook,...
         */
        $scope.oauthLogin = function (provider) {
            var providerData = getProviderData(provider);
            if (provider == 'facebook') {
                /**
                 * Signin with facebook
                 */
                auth.$signInWithPopup(providerData)
                    .then(function (authData) {
                        return createUserProfile(authData.user);
                    }).then(function (userProfile) {
                        $('#signInModal').modal('hide');
                        redirect();
                    }).catch(function (error) {
                        console.log("login error");
                        console.log(error);
                    });
            } else {
                /**
                 * Sigin with email and password
                 */
                //Check validate
                if (!checkValidate()) {
                    $scope.checkSignIn = true;
                    return;
                }

                //Signin
                $scope.disabledButton = true;
                $scope.loading = true;
                $scope.checkSignIn = true;
                auth.$signInWithEmailAndPassword($scope.userSignin.email, $scope.userSignin.password)
                    .then(function (data) {
                        $('#signInModal').modal('hide');
                        $scope.disabledButton = false;
                        $scope.loading = false;
                        redirect();
                    }).catch(function (err) {
                        $scope.disabledButton = false;
                        $scope.loading = false;
                        if (err.code) {
                            $scope.checkSignIn = false;
                        }
                    });
            }
        };

        $scope.oauthSignUp = function () {
            // Check validate
            if (!checkValidate('signup'))
                return;

            // Signup
            $scope.disabledButton = true;
            $scope.loading = true;
            auth.$createUserWithEmailAndPassword($scope.userSignup.email, $scope.userSignup.password)
                .then(function (data) {
                    var a = data;
                    return createUserProfile(data, 'password');
                })
                .then(function (data) {
                    $('#signUpModal').modal('hide');
                    $scope.disabledButton = false;
                    $scope.loading = false;
                    redirect();
                }).catch(function (err) {
                    $scope.disabledButton = false;
                    $scope.loading = false;
                    if (err.code) {
                        $scope.checkSignIn = false;
                    }
                });
        }

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
         * Open signin form
         */
        $scope.signInForm = function () {
            $scope.checkEmail = true;
            $scope.checkPassword = true;
            $scope.checkSignIn = true;
            $scope.checkConfirmPassword = true;
            $scope.checkFullName = true;
            $scope.loading = false;
            $scope.userSignin = {};
            $('#signInModal').modal('show');
        };

        /**
         * Open signup form
         */
        $scope.signUpForm = function () {
            $scope.checkEmail = true;
            $scope.checkPassword = true;
            $scope.checkSignIn = true;
            $scope.checkConfirmPassword = true;
            $scope.checkFullName = true;
            $scope.loading = false;
            $scope.userSignup = {};
            $('#signUpModal').modal('show');
        };


        /**
         * Create or update user profile when login
         */
        function createUserProfile(userData, type) {
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
                            active: true //For new user trial
                        }
                    };
                    if (type == 'password')
                        userProfile.profile.fullName = $scope.userSignup.fullName;
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
                for (var i in providerData) {
                    if (providerData[i] instanceof Array) {
                        providerData[i].push('email');
                    }
                }
            }
            return providerData;
        }

        function checkValidate(type) {
            var form = $scope.form;
            var user = $scope.userSignin;
            if (type == 'signup') {
                form = $scope.form_signup;
                user = $scope.userSignup;
            }

            var result = true;

            //Check email
            if ((user && !user.email) || !form.email.$valid) {
                $scope.checkEmail = false;
                result = false;
            }
            else {
                $scope.checkEmail = true;
            }

            //Check password
            if (user && !user.password) {
                $scope.checkPassword = false;
                result = false;
            }
            else {
                $scope.checkPassword = true;
            }

            //Check confirm password (if any in form)
            if (form.confirm_password) {
                if (user.password != user.confirmPassword || !user.confirmPassword) {
                    $scope.checkConfirmPassword = false;
                    result = false;
                } else {
                    $scope.checkConfirmPassword = true;
                }
            }

            if (form.full_name) {
                //Check full name (if any in form)
                if (user && !user.fullName) {
                    $scope.checkFullName = false;
                    result = false;
                }
                else {
                    $scope.checkFullName = true;
                }
            }
            return result;
        }

        $(document).on('hidden.bs.modal', '.modal', function () {
            var $this = $(this);
            $this.find('input').val('');
            $scope.$apply(function () {
                $scope.userSignin = {};
                $scope.userSignup = {};
            })
        });

    })