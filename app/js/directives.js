'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).directive('ngUnique', ['$http', function ($http) {
  	return {
  		require: 'ngModel',
  		link: function (scope, elem, attrs, ctrl) {
  			elem.on('input', function (evt) {
  				scope.$apply(function () {
  					var req,
                val = elem.val();

            if (attrs.type == "text") {
              req = {"username": val};
            } else if (attrs.type == "email") {
              req = {"email": val};
            }

  					$http({
  						method: 'POST',
  						url: '/checkuser',
  						data: req,
  						headers: {'Content-Type': 'application/json'}
  					}).success(function (data) {
  						if (data.length === 0) {
  							ctrl.$setValidity('unique', true);
  						} else {
  							ctrl.$setValidity('unique', false);
  						}
  					});
  				});
  			});
  		}
  	}
  }]);
