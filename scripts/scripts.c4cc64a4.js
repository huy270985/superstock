'use strict';

/**
 * @ngdoc overview
 * @name superstockApp
 * @description
 * # superstockApp
 *
 * Main module of the application.
 */
angular.module('superstockApp', [
        // 'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'firebase',
        'ui.grid',
        'ui.grid.pinning',
        'firebase.auth',
        'firebase.ref',
        'ui.slider',
        'btorfs.multiselect'
    ])
    // .run(function() {
    //     $('.navbar-left').children().click(function() {
    //         $('.navbar-left').children().removeClass('active');
    //         if (window.location.href.split('/')[4] == '') {
    //             $('.navbar-left').children().first().addClass('active')
    //         } else {
    //             $('.navbar-left').children().next().first().addClass('active')
    //         }
    //     })
    // })

$(document).on('click', '.ui-grid-row', function() {
    var thisRow = $(this);
    var classList = thisRow.find('.click-row').length;
    $('.ui-grid-row').find('.ui-grid-cell').removeClass('click-row');
    // setTimeout(function() {
    if (classList > 0) {
        thisRow.children().children().removeClass('click-row');
    } else {
        thisRow.children().children().addClass('click-row');
    }
    // }, 50)
})
'use strict';
angular
    .module('superstockApp')
    .factory('draw', function($firebaseArray) {
        var drawGrid = function(Ref, config, loading, loaded, event) {
            var data = $firebaseArray(Ref);
            var lstObj = [];
            var loadingFlag = true;
            data.$watch(function(watchData) {
                if (loadingFlag == false) return;
                if (data.length == 0) return;
                var popData = data[data.length - 1];
                var obj = {};
                if (config.idLabel)
                    obj[config.idLabel] = popData.$id;
                var arr = popData.$value.split('|');
                for (var j in config.labelList) {
                    // console.log(j);
                    if (config.labelList[j].format.indexOf('percent') > -1) {
                        obj[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                    } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                        obj[config.labelList[j].fieldName] = parseFloat(arr[j]);
                    } else {
                        obj[config.labelList[j].fieldName] = arr[j];
                    }

                }
                loading(obj);
                lstObj.push(obj);
            });
            data.$loaded(function() {
                loadingFlag = false;
                loaded(data);
                console.log('loaded');
                Ref.on('child_added', function(childSnapshot, prevChildKey) {
                    console.log('add');
                    var dataConvert = {};
                    if (config.idLabel)
                        dataConvert[config.idLabel] = childSnapshot.key;
                    var arr = childSnapshot.val().split('|');
                    for (var j in config.labelList) {
                        if (config.labelList[j].format.indexOf('percent') > -1) {
                            dataConvert[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                        } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                            dataConvert[config.labelList[j].fieldName] = parseFloat(arr[j]);
                        } else {
                            dataConvert[config.labelList[j].fieldName] = arr[j];
                        }
                    }
                    event.added(dataConvert, childSnapshot, prevChildKey);
                });

                Ref.on('child_changed', function(childSnapshot, prevChildKey) {
                    console.log('change');
                    var dataConvert = {};
                    if (config.idLabel)
                        dataConvert[config.idLabel] = childSnapshot.key;
                    var arr = childSnapshot.val().split('|');
                    for (var j in config.labelList) {
                        if (config.labelList[j].format.indexOf('percent') > -1) {
                            dataConvert[config.labelList[j].fieldName] = Math.ceil(arr[j] * 10000) / 100; // + '%';
                        } else if (config.labelList[j].format.indexOf('bigNum') > -1 || config.labelList[j].format.indexOf('number') > -1) {
                            dataConvert[config.labelList[j].fieldName] = parseFloat(arr[j]);
                        } else {
                            dataConvert[config.labelList[j].fieldName] = arr[j];
                        }
                    }
                    event.changed(dataConvert, childSnapshot, prevChildKey);
                });

                Ref.on('child_removed', function(oldChildSnapshot) {
                    console.log('remove');
                    event.removed(oldChildSnapshot);
                });
            })
        }


        return {
            drawGrid: drawGrid
        }
    })
'use strict';

angular
    .module('superstockApp')
    .factory('utils', function() {
        return {
            getCellTemplate: function(fieldName, format) {
                switch (fieldName) {
                    case 'priceChange':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 0, \'grid-cell-green\': COL_FIELD >= 0}">{{COL_FIELD | number}}</div>';
                    case 'EPS':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 1000, \'grid-cell-green\': COL_FIELD > 1000}">{{COL_FIELD | number}}</div>';
                    case 'revenueChange':
                    case 'EPSChange':
                    case 'profitChange':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 0, \'grid-cell-green\': COL_FIELD > 0}">{{COL_FIELD | number}}</div>';
                    case 'point':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 5, \'grid-cell-green\': COL_FIELD >= 5, \'grid-cell-purple\': COL_FIELD >= 7}">{{COL_FIELD | number}}</div>';
                    case 'roe':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 10, \'grid-cell-green\': COL_FIELD > 10 }">{{COL_FIELD | number}}</div>';
                    case 'fxEffect':
                    case 'cashFlow':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 0, \'grid-cell-green\': COL_FIELD > 0 }">{{COL_FIELD | number}}</div>';
                    default:
                        if (format)
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
                }
            },
            getCellTemplateSummary: function(fieldName, format) {
                switch (fieldName) {
                    case 'symbol':
                        return '<div class="chart-pointer" title="{{COL_FIELD}}" ng-click="grid.appScope.symbolClick(row,col)" ng-class="{\'ui-grid-cell-contents\': true,\
                        \'grid-cell-purple\': grid.appScope.colorCanslim(row,\'purple\'), \
                        \'grid-cell-green\': grid.appScope.colorCanslim(row,\'green\'), \
                        \'grid-cell-fill\': grid.appScope.fillCanslim(row)}">{{COL_FIELD}}</div>';
                    case 'totalValue':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true,\
                         \'grid-cell-purple\': COL_FIELD >= 5e9, \'grid-cell-fill\': COL_FIELD >= 5e9}">{{COL_FIELD | number}}</div>';
                    case 'EPS':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-red\': COL_FIELD < 1000, \'grid-cell-green\': COL_FIELD > 1000, \'grid-cell-fill\': COL_FIELD >= 3000}">{{COL_FIELD | number}}</div>';
                    case 'Canslim':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-purple\': COL_FIELD, \'grid-cell-fill\': COL_FIELD }">{{COL_FIELD}}</div>';
                    case 'pricePeak': ///Vượt đỉnh giá, chưa biết server trả về field tên gì 
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \
                        \'grid-cell-purple\': COL_FIELD && \'cao nhất 30 phiên\' == COL_FIELD.trim().toLowerCase(), \
                        \'grid-cell-fill\': COL_FIELD && \'cao nhất 30 phiên\' == COL_FIELD.trim().toLowerCase()}">{{COL_FIELD}}</div>';
                    case 'signal1':
                    case 'signal2':
                        return '<div title="{{COL_FIELD}}" ng-class="{\'ui-grid-cell-contents\': true, \'grid-cell-purple\': COL_FIELD, \'grid-cell-fill\': COL_FIELD}">{{COL_FIELD}}</div>';
                    case 'chart':
                    case 'symbol2':
                        return '<div class="chart-pointer" title="{{COL_FIELD}}" ng-click="grid.appScope.symbolClick(row,col)" ng-class="{\'ui-grid-cell-contents\': true,\
                        \'grid-cell-purple\': grid.appScope.colorCanslim(row,\'purple\'), \
                        \'grid-cell-green\': grid.appScope.colorCanslim(row,\'green\'), \
                        \'grid-cell-fill\': grid.appScope.fillCanslim(row)}">{{COL_FIELD}}</div>';
                    default:
                        if (format == 'number' || format == 'bigNumber')
                            return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD | number}}</div>';
                        return '<div title="{{COL_FIELD}}" class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
                }
            }
        }
    });
'use strict';

angular.module('superstockApp')
  .filter('reverse', function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  });

'use strict';

angular.module('firebase.auth', [])
    .constant('SIMPLE_LOGIN_PROVIDERS', ['password','facebook'])
    .constant('loginRedirectPath', '/login')
    .factory('auth', ["$firebaseAuth", function ($firebaseAuth) {
        return $firebaseAuth();
    }]);

angular.module('firebase.ref', ['firebase'])
  .factory('Ref', function() {
    'use strict';
    return firebase.database().ref();
  });

'use strict';
/**
 * @ngdoc function
 * @name superstockApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('superstockApp')
  .controller('LoginCtrl', ["$scope", "auth", "$location", function ($scope, auth, $location) {

    $scope.loginBtn = true;
    $scope.logoutBtn = true;

    auth.$onAuthStateChanged(function (authData) {
      if (authData) {
        console.log(" logged: " + authData.uid);
        $scope.logoutBtn = true;
        $scope.loginBtn = false;
        $location.path('/account');
      }
    });

    

      // SignIn with a Provider
      $scope.oauthLogin = function (provider) {
        auth.$signInWithPopup(provider)
          .then(function (authData) {
            console.log("logged");
            redirect();
          })
          .catch(function (error) {
            console.log("login error");
            showError(error);
          })
      };

      // Anonymous login method
      $scope.anonymousLogin = function () {
        auth.$signInAnonymously()
          .then(function (authData) {
            console.log("logged ", authData.uid);
          })
          .catch(function (error) {
            console.log("login error ", error);
          })
      };

    

    

      // Autenthication with password and email
      $scope.passwordLogin = function (email, pass) {

        auth.$signInWithEmailAndPassword(email, pass)
          .then(function (authData) {
            redirect();
            console.log("logged");
          })
          .catch(function (error) {
            showError(error);
            console.log("error: " + error);
          });
      };

      $scope.createAccount = function (email, pass, confirm) {
        $scope.err = null;

        if (!pass) {
          $scope.err = 'Please enter a password';
        } else if (pass !== confirm) {
          $scope.err = 'Passwords do not match';
        } else {
          auth.$createUserWithEmailAndPassword(email, pass)
            .then(function (userData) {
              console.log("User " + userData.uid + " created successfully");
              return userData;
            })
            .then(function (authData) {
            console.log("Logged user: ", authData.uid);
              createProfile();
              redirect();
            })
            .catch(function (error) {
              console.error("Error: ", error);
            });
          }
        };

        //todo wait till SDK 3.x support comes up to test
        function createProfile(user) {

          // var query =
          var userObj = rootRef.child('users').child(user.uid);
          var def = $q.defer();
          ref.set({email: email, name: firstPartOfEmail(email)}, function (err) {
            $timeout(function () {
              if (err) {
                def.reject(err);
              }
              else {
                def.resolve(ref);
              }
            });
          });
          return def.promise;
        }

      function firstPartOfEmail(email) {
        return ucfirst(email.substr(0, email.indexOf('@')) || '');
      }

      function ucfirst(str) {
        // inspired by: http://kevin.vanzonneveld.net
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
      }

    

    function redirect() {
      $location.path('/account');
    }

    function showError(err) {
      $scope.err = err;
    }


  }]);

'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('superstockApp')
  .controller('AccountCtrl', ["$scope", "auth", "currentAuth", function (
    $scope,
    auth,
    currentAuth
  , $timeout 
  ) {

  $scope.user = {
    uid: currentAuth.uid,
    name: currentAuth.displayName,
    photo: currentAuth.photoURL,
    email: currentAuth.email
  };

    

    $scope.authInfo = currentAuth;
    
    $scope.changePassword = function(oldPass, newPass, confirm) {
      $scope.err = null;

      if( !oldPass || !newPass ) {
        error('Please enter all fields');

      } else if( newPass !== confirm ) {
        error('Passwords do not match');

      } else {
        // New Method
        auth.$updatePassword(newPass).then(function() {
          console.log('Password changed');
        }, error);

      }
    };

    $scope.changeEmail = function (newEmail) {
      auth.$updateEmail(newEmail)
        .then(function () {
          console.log("email changed successfully");
        })
        .catch(function (error) {
          console.log("Error: ", error);
        })
    };

    $scope.logout = function() {
      auth.$signOut();
    };

    function error(err) {
      console.log("Error: ", err);
    }

    function success(msg) {
      alert(msg, 'success');
    }

    function alert(msg, type) {
      var obj = {text: msg+'', type: type};
      $scope.messages.unshift(obj);
      $timeout(function() {
        $scope.messages.splice($scope.messages.indexOf(obj), 1);
      }, 10000);
    }

  $scope.updateProfile = function(name, imgUrl) {
    firebase.auth().currentUser.updateProfile({
      displayName: name,
      photoURL: imgUrl
    })
      .then(function () {
        console.log("updated");
      })
      .catch(function (error) {
        console.log("error ", error);
      })
  };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('MainCtrl', function($rootScope, $scope, $firebaseArray, $firebaseObject, Ref, draw, utils, $window, $sce) {
        $rootScope.link = 'main';
        $window.ga('send', 'event', "Page", "Tổng hợp");


        $('.view-containner').css('width', $(document).width() + 'px');
        $("#wrapper").addClass("toggled");
        var heightOut = parseFloat($('.header').css('height')) + parseFloat($('.footer').css('height'));
        var heightWin = $(document).height();
        var heightHead = 30;
        $scope.gridOptions = {
            minRowsToShow: Math.floor((heightWin - heightOut - heightHead) / 30),
            data: []
        };
        console.log($scope.gridOptions);
        var titles = $firebaseObject(Ref.child('summary_titles'));
        var fields = $firebaseObject(Ref.child('summary_headers'));
        var format = $firebaseObject(Ref.child('summary_format'));
        titles.$loaded(function() {
            fields.$loaded(function() {
                format.$loaded(function() {
                    var titlesArr = titles.data.split('|');
                    var fieldsArr = fields.data.split('|');
                    var formatArr = format.data.split('|');
                    console.log(formatArr);
                    console.log(titlesArr);
                    console.log(fieldsArr);
                    var colWidths = [
                        75, '*', 130, 85, 80, 80, 85, 140, 140, 80, 140
                    ]
                    var columnDefs = [];
                    var config = {
                        idLabel: 'Mã',
                        labelList: []
                    }
                    for (var i in titlesArr) {
                        config.labelList.push({
                            fieldName: fieldsArr[i],
                            format: formatArr[i]
                        });
                        var formatType = null;
                        var cellClass = null;
                        if (formatArr[i].indexOf('bigNum') > -1 || formatArr[i].indexOf('number') > -1) {
                            formatType = 'number';
                            cellClass = 'ui-cell-align-right'
                        } else if (formatArr[i].indexOf('percent') > -1) {
                            cellClass = 'ui-cell-align-right'
                        } else {
                            cellClass = 'ui-cell-align-left'
                        }
                        var def = {
                            field: fieldsArr[i],
                            displayName: titlesArr[i],
                            cellClass: cellClass,
                            width: colWidths[i]
                        }
                        if (formatType) def.cellFilter = formatType;
                        if (formatArr[i].indexOf('percent') > -1) def.cellClass += ' percent';
                        def.cellTemplate = utils.getCellTemplateSummary(fieldsArr[i], formatArr[i]);
                        columnDefs.push(def);
                    }
                    for (var i in columnDefs) {
                        if (columnDefs[i].field == 'symbol') {
                            columnDefs[i].pinnedLeft = true;
                            // columnDefs[i].cellTemplate = '<div class="chart-pointer"><div ng-click="grid.appScope.symbolClick(row,col)" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>';
                        }
                        if (columnDefs[i].field == 'totalValue') {
                            columnDefs[i].sort = {
                                direction: 'desc',
                                priority: 0
                            }
                        }
                    }
                    // $rootScope.filters = columnDefs;
                    $scope.gridOptions.columnDefs = columnDefs;
                    draw.drawGrid(Ref.child('summary_data'), config, function(data) {
                        $scope.gridOptions.data.push(data);
                    }, function(data) {
                        setTimeout(function() {
                            align();
                        }, 1000);
                    }, {
                        added: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.gridOptions.data[i] = data;
                                    return;
                                }
                            }
                            $scope.gridOptions.data.push(data);
                        },
                        changed: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.$apply(function() {
                                        for (var key in data) {
                                            $scope.gridOptions.data[i][key] = data[key];
                                        }
                                    })
                                    break;
                                }
                            }
                        },
                        removed: function(oldChildSnapshot) {
                            var key = oldChildSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.gridOptions.data.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });
                    $scope.symbolClick = function(row, col) {
                        $('#myModal').modal('show');
                        $scope.stockInfo = row.entity.symbol + ' - ' + row.entity.industry;
                        $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + row.entity.symbol;
                        $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
                    }

                    $scope.fillCanslim = function(row) {
                        if ((row.entity.signal1 != '' || row.entity.signal2 != '')) return true;
                        return false;
                    }

                    $scope.colorCanslim = function(row, color) {
                        if ((row.entity.signal1 != '' || row.entity.signal2 != '')) {
                            if (row.entity.Canslim != '') {
                                if (color == 'purple') return true;
                                return false;
                            } else {
                                if (color == 'green') return true;
                                return false;
                            }
                        }
                        return false;
                    }

                    function align() {
                        $('.ui-grid-header-cell').each(function() {
                            var thisTag = $(this);
                            var span = thisTag.find('span');
                            if (span.text().indexOf('\n') < 0) {
                                span.parent().css('line-height', '40px');
                                thisTag.css('text-align', 'center');
                            } else {
                                span.last().css('margin-top', '-2px');
                            }
                        })
                    }
                })
            })
        })
    });
'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FullStockCtrl
 * @description
 * # FullStockCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FullStockCtrl', function($rootScope, $scope, auth, $firebaseArray,
        $firebaseObject, Ref, draw, uiGridConstants, $sce, utils, currentAuth, $window) {
        $rootScope.link = 'full';
        $window.ga('send', 'event', "Page", "Đầy đủ");
        var userFilters = null;
        var user = null;
        var userAuthData = null;
        var filterData = null;
        if (currentAuth) {
            var filter = $firebaseObject(Ref.child('users/' + currentAuth.uid + '/filter'));
            filter.$loaded(function(data) {
                filterData = {};
                for (var i in data) {
                    if (i.charAt(0) != '$' && i != 'forEach') {
                        filterData[i] = data[i];
                    }
                }
                if ($scope.gridOptions.columnDefs) {
                    $scope.gridOptions.columnDefs = filterConvert($scope.gridOptions.columnDefs, filterData);
                }
            });


            // defaultFilter.child('defaultFilter').set({
            //     "Cơ bản tốt": {
            //         point: 7,
            //         EPS: 1000,
            //         profitChange: 20,
            //         roe: 7,
            //         maVol30: 300000000
            //     }
            // }, function(err) {
            //     console.log(err);
            // })
        }
        $("#wrapper").addClass("toggled");
        $scope.iSrc = '';
        $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
        $scope.uiGridConstants = uiGridConstants;
        var heightOut = parseFloat($('.header').css('height')) + parseFloat($('.footer').css('height'));
        var heightWin = $(document).height();
        var heightHead = 30;
        $scope.gridOptions = {
            flatEntityAccess: true,
            fastWatch: true,
            enableFiltering: true,
            // useExternalFiltering: true,
            excessRows: 50,
            excessColumns: 32,
            minRowsToShow: Math.floor((heightWin - heightOut - 30 - 15 - heightHead) / 30),
            data: [],
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.core.on.filterChanged($scope, function() {
                    user = Ref.child('users/' + currentAuth.uid);
                    var filter = filterConvert($scope.gridOptions.columnDefs, null);
                    user.child('filter').set(filter, function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Saved filter');
                        }
                    });
                });
            }
        };

        function filterConvert(rowDefs, filters) {
            if (filters) {
                for (var i in filters) {
                    for (var j in rowDefs) {
                        if (rowDefs[j].field == i) {
                            if (rowDefs[j].filters)
                                rowDefs[j].filters[0].term = filters[i];
                            else if (rowDefs[j].filter)
                                rowDefs[j].filter.term = filters[i];
                            break;
                        }
                    }
                }
                return rowDefs;
            } else {
                filters = {};
                for (var i in rowDefs) {
                    if (rowDefs[i].filters) {
                        filters[rowDefs[i].field] = (rowDefs[i].filters[0] && rowDefs[i].filters[0].term) ? rowDefs[i].filters[0].term : null;
                    } else if (rowDefs[i].filter) {
                        filters[rowDefs[i].field] = (rowDefs[i].filter.term) ? rowDefs[i].filter.term : null;
                    }
                }
                return filters;
            }
        }
        var bigNum = 1000000000;
        var titles = $firebaseObject(Ref.child('superstock_titles'));
        var fields = $firebaseObject(Ref.child('superstock_fields'));
        var format = $firebaseObject(Ref.child('superstock_format'));
        fields.$loaded(function() {
            titles.$loaded(function() {
                format.$loaded(function() {
                    var titlesArr = titles.data.split('|');
                    var fieldsArr = fields.data.split('|');
                    var formatArr = format.data.split('|');
                    console.log(formatArr);
                    console.log(titlesArr);
                    console.log(fieldsArr);
                    var sizeArr = [
                        70,  200, 130, 100, 110, 120, 120, 130,
                        80,  150, 160, 150, 90,  140, 100, 120,
                        140, 120, 120, 120, 100, 90,  90,  140,
                        140, 140, 170, 80,  140, 110, 140, 100,
                        120, 120, 140, 120, 120, 120, 120, 100, 
                        100, 140, 80, 140
                    ];
                    var columnDefs = [];
                    var config = {
                        idLabel: 'Mã',
                        labelList: []
                    }
                    for (var i in titlesArr) {
                        // titlesArr[i] = titlesArr[i].replace('\n', '');
                        config.labelList.push({
                            fieldName: fieldsArr[i],
                            format: formatArr[i]
                        });
                        var formatType = null;
                        var cellClass = null;
                        if (formatArr[i].indexOf('bigNum') > -1 || formatArr[i].indexOf('number') > -1) {
                            formatType = 'number';
                            cellClass = 'ui-cell-align-right'
                        } else if (formatArr[i].indexOf('percent') > -1) {
                            cellClass = 'ui-cell-align-right'
                        } else {
                            cellClass = 'ui-cell-align-left'
                        }
                        var def = {
                            field: fieldsArr[i],
                            width: sizeArr[i],
                            displayName: titlesArr[i],
                            cellClass: cellClass
                        }
                        if (formatType) def.cellFilter = formatType;
                        if (formatArr[i].indexOf('percent') > -1) def.cellClass += ' percent';
                        if (formatArr[i] != '') {
                            var arr = formatArr[i].split(':');
                            console.log(titlesArr[i], arr[0], arr[1], arr[2], arr[3]);
                            if(arr.length === 4){
                                var filters = [{
                                    condition: uiGridConstants.filter.GREATER_THAN,
                                    placeholder: 'greater than',
                                    term: (arr[0] == 'bigNum') ? parseFloat(arr[2]) * bigNum : parseFloat(arr[2]),
                                    min: (arr[0] == 'bigNum') ? parseFloat(arr[1]) * bigNum : parseFloat(arr[1]),
                                    bigNum: (arr[0] == 'bigNum') ? true : false
                                }, {
                                    condition: uiGridConstants.filter.LESS_THAN,
                                    placeholder: 'less than',
                                    term: Infinity,
                                    max: (arr[0] == 'bigNum') ? parseFloat(arr[3]) * bigNum : parseFloat(arr[3])
                                }];
                                def.filters = filters;
                                def.cellTemplate = utils.getCellTemplate(fieldsArr[i], true);
                            }
                        } else {
                            def.cellTemplate = utils.getCellTemplate(fieldsArr[i]);
                        }
                        if (fieldsArr[i] == 'shorttermSignal') {
                            def.filter = {
                                term: null,
                                // type: uiGridConstants.filter.SELECT,
                                selectOptions: [{
                                    value: 'xBán',
                                    label: 'Bán'
                                }, {
                                    value: 'xMua nếu cơ bản tốt',
                                    label: 'Mua'
                                }],
                                condition: function(searchTerm, cellValue) {
                                    var tempSearchTerm = [];
                                    for (var i in searchTerm) {
                                        tempSearchTerm.push(searchTerm[i].value);
                                    }
                                    if (!tempSearchTerm || searchTerm.length == 0) return true;
                                    return (tempSearchTerm.indexOf(cellValue) > -1);
                                }
                            }
                        } else if (fieldsArr[i] == 'industry') {
                            def.filter = {
                                // term: null,
                                // type: uiGridConstants.filter.SELECT,
                                selectOptions: [{
                                    value: 'Bao bì & đóng gói',
                                    label: 'Bao bì & đóng gói'
                                }, {
                                    value: 'Nông sản và thủy hải sản',
                                    label: 'Nông sản và thủy hải sản'
                                }, {
                                    value: 'Ngân hàng',
                                    label: 'Ngân hàng'
                                }, {
                                    value: 'Thực phẩm',
                                    label: 'Thực phẩm'
                                }],
                                // selectOptions: ['Bao bì & đóng gói', 'Nông sản và thủy hải sản', 'Ngân hàng', 'Thực phẩm'],
                                typeSearch: 'multiple',
                                term: null,
                                condition: function(searchTerm, cellValue) {
                                    var tempSearchTerm = [];
                                    for (var i in searchTerm) {
                                        tempSearchTerm.push(searchTerm[i].value);
                                    }
                                    if (!tempSearchTerm || searchTerm.length == 0) return true;
                                    return (tempSearchTerm.indexOf(cellValue) > -1);
                                }
                            }
                        }
                        columnDefs.push(def);
                    }
                    for (var i in columnDefs) {
                        if (columnDefs[i].field == 'symbol') {
                            columnDefs[i].pinnedLeft = true;
                            columnDefs[i].cellTemplate = '<div><div ng-click="grid.appScope.symbolClick(row,col)" class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div></div>';
                        }
                    }
                    $rootScope.filters = columnDefs;
                    $scope.gridOptions.columnDefs = columnDefs;
                    console.log(columnDefs);
                    if (filterData) {
                        $scope.gridOptions.columnDefs = filterConvert($scope.gridOptions.columnDefs, filterData);
                    }
                    draw.drawGrid(Ref.child('superstock'), config, function(data) {
                        $scope.gridOptions.data.push(data);
                    }, function(data) {
                        setTimeout(function() {
                            align();
                        }, 1000);
                        // columnDefs[0].pinnedLeft = true
                        // $scope.gridOptions.columnDefs = columnDefs;
                        // $scope.gridOptions.data = data;
                        // console.log($scope.gridOptions.data);
                    }, {
                        added: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.gridOptions.data[i] = data;
                                    return;
                                }
                            }
                            $scope.gridOptions.data.push(data);
                        },
                        changed: function(data, childSnapshot, id) {
                            var key = childSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.$apply(function() {
                                        for (var key in data) {
                                            $scope.gridOptions.data[i][key] = data[key];
                                        }
                                    })
                                    break;
                                }
                            }
                        },
                        removed: function(oldChildSnapshot) {
                            var key = oldChildSnapshot.key;
                            for (var i in $scope.gridOptions.data) {
                                if ($scope.gridOptions.data[i]['symbol'] == key) {
                                    $scope.gridOptions.data.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    })
                })
            })
        });

        $rootScope.parseBigNum = function(term) {
            var newTerm = parseFloat(term) / bigNum;
            return newTerm;
        }
        $scope.symbolClick = function(row, col) {
            $('#myModal').modal('show');
            $scope.stockInfo = row.entity.symbol + ' - ' + row.entity.industry;
            $scope.iSrc = 'https://banggia.vndirect.com.vn/chart/?symbol=' + row.entity.symbol;
            $scope.iSrcTrust = $sce.trustAsResourceUrl($scope.iSrc);
        }

        $rootScope.search = function(searchTerm) {
            $scope.gridApi.grid.columns[0].filters[0] = {
                term: $rootScope.searchTerm
            };
        }
        $rootScope.defaultFilter = function(filter) {
            if (filter) filter = filter[0];
            else return;
            $window.ga('send', 'event', "Filter", filter.filterName);
            for (var i in $scope.gridOptions.columnDefs) {
                var fieldName = $scope.gridOptions.columnDefs[i].field;
                for (var j in filter) {
                    if (j != 'filterName') {
                        if (j == fieldName) {
                            if ($scope.gridOptions.columnDefs[i].filters) {
                                $scope.gridOptions.columnDefs[i].filters[0].term = filter[j];
                            }
                            break;
                        }
                    }
                }
            }
        }

        // var defaultFormat = Ref.children('')

        // $scope.industryClick = function(index, row, col) {
        //     var industry = row.entity.industry;
        // }
        function align() {
            $('.ui-grid-header-cell').each(function() {
                var thisTag = $(this);
                var span = thisTag.find('span');
                if (span.text().indexOf('\n') < 0) {
                    span.parent().css('line-height', '40px');
                    thisTag.css('text-align', 'center');
                } else {
                    span.last().css('margin-top', '-2px');
                }
            })
        }
        $(document).ready(function() {
            $(document).on('change', '.subTerm', function() {
                var subTerm = $(this);
                subTerm.prop('value', subTerm.val());
                var field = subTerm.prop('id');
                for (var i in $scope.gridOptions.columnDefs) {
                    if ($scope.gridOptions.columnDefs[i].field == field) {
                        $scope.$apply(function() {
                            $scope.gridOptions.columnDefs[i].filters[0].term = parseFloat(subTerm.val()) * bigNum;
                            subTerm.prop('value', subTerm.val());
                        })
                        break;
                    }
                }
                subTerm.parent().next().children().slider({
                    slide: function(event, ui) {
                        subTerm.prop('value', ui.value / bigNum);
                    }
                });
            });
        });
    })
    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });
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

        // var timeUse = $firebaseObject(Ref.child('title'));
        // timeUse.$loaded(function(data) {
        //     console.log(data);
        //     $scope.timeUse = data.$value;
        // })

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
'use strict';

/**
 * @ngdoc function
 * @name superstockApp.controller:FilterCtrl
 * @description
 * # FilterCtrl
 * Controller of the superstockApp
 */
angular.module('superstockApp')
    .controller('FilterCtrl', function($rootScope, $scope, Ref, $firebaseArray, $compile) {
        // $scope.demoVals = {
        //     sliderExample3: 14
        // }

        // $rootScope.abc = 10000;
        // $rootScope.filters = [];
        // $rootScope.subTerm = [];
        // Ref.child('users/defaultFilter').on('value', function(data){
        //     console.log(data);
        // }, function(err){
        //     console.log(err);
        // });
        $scope.defaultFilter = [{"EPS":1000,"maVol30":300000000,"point":7,"profitChange":20,"roe":7,"filterName":"Cơ bản tốt"}];
        // var html = '<multiselect ng-model="filter" options="defaultFilter" class="signle-select" selection-limit="1" id-prop="filterName" display-prop="filterName"></multiselect>';
        // $('.default-filter').html($compile(html)($scope));
        // $scope.defaultFilter = [];
        // var defaultFilter = $firebaseArray(Ref.child('users/defaultFilter'));
        // defaultFilter.$loaded(function(data) {
        //     var html = '<multiselect ng-model="filter" options="defaultFilter" class="signle-select" selection-limit="1" id-prop="filterName" display-prop="filterName"></multiselect>';
        //     for (var i = 0; i < data.length; i++) {
        //         var obj = {};
        //         for (var key in data[i]) {
        //             if (key.indexOf('$') < 0) {
        //                 obj[key] = data[i][key];
        //             }
        //         }
        //         obj['filterName'] = data[i].$id;
        //         $scope.defaultFilter.push(obj);
        //     }

        //     $('.default-filter').html($compile(html)($scope));
        // });
        $scope.$watch('filter', function() {
            if($rootScope.defaultFilter){
                $rootScope.defaultFilter($scope.filter);
            }
        })
    });
/**
 * @ngdoc function
 * @name superstockApp.directive:ngShowAuth
 * @description
 * # ngShowAuthDirective
 * A directive that shows elements only when user is logged in. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('superstockApp')
  .directive('ngShowAuth', ['auth', '$timeout', function (auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !auth.$getAuth());
          }, 0);
        }

        auth.$onAuthStateChanged(update);
        update();
      }
    };
  }]);


/**
 * @ngdoc function
 * @name superstockApp.directive:ngHideAuth
 * @description
 * # ngHideAuthDirective
 * A directive that shows elements only when user is logged out. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('superstockApp')
  .directive('ngHideAuth', ['auth', '$timeout', function (auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it
        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !!auth.$getAuth());
          }, 0);
        }

        auth.$onAuthStateChanged(update);
        update();
      }
    };
  }]);

angular.module('superstockApp')
    .directive('categoryHeader', function() {
        function link(scope) {


            console.log(scope.gridOptions.columnDefs);
            scope.headerRowHeight = 30;
            scope.catHeaderRowHeight = scope.headerRowHeight + 'px';
            scope.categories = [];
            var lastDisplayName = "";
            var totalWidth = 0;
            var left = 0;
            cols = scope.gridOptions.columnDefs;
            for (var i = 0; i < cols.length; i++) {



                totalWidth += Number(cols[i].width);


                var displayName = (typeof(cols[i].categoryDisplayName) === "undefined") ?
                    "\u00A0" : cols[i].categoryDisplayName;

                if (displayName !== lastDisplayName) {

                    scope.categories.push({
                        displayName: lastDisplayName,
                        width: totalWidth - Number(cols[i].width),
                        widthPx: (totalWidth - Number(cols[i].width)) + 'px',
                        left: left,
                        leftPx: left + 'px'
                    });

                    left += (totalWidth - Number(cols[i].width));
                    totalWidth = Number(cols[i].width);
                    lastDisplayName = displayName;
                }
            }

            if (totalWidth > 0) {

                scope.categories.push({
                    displayName: lastDisplayName,
                    width: totalWidth,
                    widthPx: totalWidth + 'px',
                    left: left,
                    leftPx: left + 'px'
                });
            }

        }
        return {


            templateUrl: 'scripts/directives/templates/category_header.html',
            link: link
        };
    });
'use strict';
/**
 * @ngdoc overview
 * @name superstockApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 * Add new routes using `yo angularfire-express:route` with the optional --auth-required flag.
 *
 * Any controller can be secured so that it will only load if user is logged in by
 * using `whenAuthenticated()` in place of `when()`. This requires the user to
 * be logged in to view this route, and adds the current user into the dependencies
 * which can be injected into the controller. If user is not logged in, the promise is
 * rejected, which is handled below by $routeChangeError
 *
 * Any controller can be forced to wait for authentication to resolve, without necessarily
 * requiring the user to be logged in, by adding a `resolve` block similar to the one below.
 * It would then inject `user` as a dependency. This could also be done in the controller,
 * but abstracting it makes things cleaner (controllers don't need to worry about auth state
 * or timing of displaying its UI components; it can assume it is taken care of when it runs)
 *
 *   resolve: {
 *     user: ['Auth', function($firebaseAuth) {
 *       return Auth.$getAuth();
 *     }]
 *   }
 *
 */
angular.module('superstockApp')

/**
 * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
 * when called, invokes Auth.$requireAuth() service (see Auth.js).
 *
 * The promise either resolves to the authenticated user object and makes it available to
 * dependency injection (see AccountCtrl), or rejects the promise if user is not logged in,
 * forcing a redirect to the /login page
 */

/*
 * Commented due to issues with the new SDK
 *
 .config(['$routeProvider', 'SECURED_ROUTES', function ($routeProvider, SECURED_ROUTES) {

 // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
 // unfortunately, a decorator cannot be use here because they are not applied until after
 // the .config calls resolve, so they can't be used during route configuration, so we have
 // to hack it directly onto the $routeProvider object
 /*
 $routeProvider.whenAuthenticated = function (path, route) {
 route.resolve = route.resolve || {};
 route.resolve.user = ['auth', function (auth) {
 return auth.$requireSignIn();
 }];
 $routeProvider.when(path, route);
 SECURED_ROUTES[path] = true;
 return $routeProvider;
 };
 }])
 */

// configure views; whenAuthenticated adds a resolve method to ensure users authenticate
// before trying to access that route
.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl',
            resolve: {
                "currentAuth": ["auth", function(auth) {
                    return auth.$waitForSignIn();
                }]
            }
        })
        .when('/full', {
            templateUrl: 'views/full-stock.html',
            controller: 'FullStockCtrl',
            resolve: {
                "currentAuth": ["auth", function(auth) {
                    return auth.$waitForSignIn();
                }]
            }
        })
        .when('/about', {
            templateUrl: 'views/about.html',
            controller: 'AboutCtrl',
            controllerAs: 'about'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/account', {
            templateUrl: 'views/account.html',
            controller: 'AccountCtrl',
            resolve: {
                "currentAuth": ["auth", function(auth) {
                    // returns a promisse so the resolve waits for it to complete
                    return auth.$requireSignIn();
                }]
            }
        })
        .when('/chat', {
            templateUrl: 'views/chat.html',
            controller: 'Chat',
            resolve: {
                "currentAuth": ["auth", function(auth) {
                    return auth.$waitForSignIn();
                }]
            }
        })
        .otherwise({
            redirectTo: '/'
        });

}])

/**
 * Apply some route security. Any route's resolve method can reject the promise with
 * "AUTH_REQUIRED" to force a redirect. This method enforces that and also watches
 * for changes in auth status which might require us to navigate away from a path
 * that we can no longer view.
 */
.run(['$rootScope', '$location', 'loginRedirectPath', 'auth',
    function($rootScope, $location, loginRedirectPath, auth, event, next, previous, error) {


        // watch for login status changes and redirect if appropriate
        auth.$onAuthStateChanged(function(authData) {
            $rootScope.user = authData;
        });

        // some of our routes may reject resolve promises with the special {authRequired: true} error
        // this redirects to the login page whenever that is encountered
        $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
            if (error === "AUTH_REQUIRED") {
                $location.path(loginRedirectPath);
            }
        });
    }
]);