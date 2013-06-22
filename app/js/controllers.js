'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [ '$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

    $http.get('/getsession').success(function (data) {      
      if (data.cookie.originalMaxAge) {
        $rootScope.loggedIn = true;
        $rootScope.loggedInUser = data.username;
      } else {
        $rootScope.loggedIn = false;
      }
    });

    // initialize variables
    var sortedTable = [],
        table = [],
        pointMargin = 0;

    // ajax call to retrieve database information
    $http.get('/DBinfo').success(init);

    function init (data) {

      table = data;

      for (var i = 0, l = table.length; i < l; i++) {
        var item = table[i];

        sortedTable.push(item);
        item.pointMargin = item.offPoints - item.defPoints;
      }

      // sort array based on pointMargin
      sortedTable.sort(function (a, b) {
          if (a.pointMargin > b.pointMargin) {
            return -1;
          } else if (a.pointMargin < b.pointMargin) {
            return 1;
          } else return 0;
        });

      
      // bind
      $scope.sortedTable = angular.copy(sortedTable);      
    }

    $scope.logout = function () {
      $rootScope.loggedIn = false;
      $http.get('/logout').success(function (data) {
        console.log(data);
      });
    }

    $scope.signup = function ($event) {

      //$event.currentTarget.disabled = true;

      $http({
        method: 'POST',
        url: '/register',
        data: $scope.newuser,
        headers: {'Content-Type': 'application/json'}
      }).success(function (data) {
        $scope.flagged = false;
        $rootScope.loggedIn = true;
        $rootScope.loggedInUser = data.username;
        //window.location.href = "#/view1";
        console.log(data);
      }).error(function (data, status, headers, config) {
        console.log(data);
        // Show error message on web page to user
        $scope.flagged = true;

        // Reset form fields
        if ($scope.newuser) {
          for (var field in $scope.newuser) { $scope.newuser[field] = ""; }
        }
      });
    }
      

    $scope.signin = function () {
        $http({
        method: 'POST',
        url: '/signin',
        data: $scope.user,
        headers: {'Content-Type': 'application/json'}
      }).success(function (data) {
        
        console.log(data);
        $rootScope.loggedIn = true;
        $rootScope.loggedInUser = data.username;

        for (var field in $scope.user) { $scope.user[field] = "";}
        
        console.log($rootScope.loggedIn);
      }).error(function (data) {
        console.log(data);
        for (var field in $scope.user) { $scope.user[field] = "";}
      });
    }
  }]);