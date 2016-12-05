angular.module('firebase.ref', ['firebase'])
  .factory('Ref', function() {
    'use strict';
    return firebase.database().ref();
  });
