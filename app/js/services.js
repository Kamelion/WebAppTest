'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  	value('version', '0.1').
  factory('socket', function () {
		return io.connect('http://localhost:8000');
	});