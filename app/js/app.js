'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/home', {templateUrl: '../partials/home.html', controller: 'MyCtrl1'});
  	$routeProvider.when('/invaders', {templateUrl: '../partials/invaders.html', controller: 'MyCtrl1'});
    $routeProvider.when('/webgl', {templateUrl: '../partials/webgl.html', controller: 'MyCtrl1'});
    $routeProvider.when('/php', {templateUrl: '../partials/php.html', controller: 'MyCtrl1'});
    $routeProvider.when('/java', {templateUrl: '../partials/java.html', controller: 'MyCtrl1'});
    $routeProvider.when('/sports', {templateUrl: '../partials/sports.html', controller: 'MyCtrl1'});
    $routeProvider.when('/signup', {templateUrl: '../partials/signup.html', controller: 'MyCtrl1'});
    $routeProvider.otherwise({redirectTo: '/home'});
  }]);
