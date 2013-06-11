'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [ '$scope', '$http', function($scope, $http) {

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
  }])
  .controller('MyCtrl2', [ '$scope', function($scope) {
    var socket = io.connect('http://localhost:8000');
    socket.on('data', function(data) {
      
      // initialize variables
      var sortedTable2 = [],
          table = data.info;

          //table = data.info;

        for (var i = 0, l = table.length; i < l; i++) {
          var item = table[i];

          sortedTable2.push(item);
        }

        // sort array based on offPoints
        sortedTable2.sort(function (a, b) {
            if (a.offPoints > b.offPoints) {
              return -1;
            } else if (a.offPoints < b.offPoints) {
              return 1;
            } else return 0;
          });

        // bind
        $scope.sortedTable2 = angular.copy(sortedTable2);
    });
  }]);