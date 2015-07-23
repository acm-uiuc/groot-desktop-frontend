//Declare app grootDesktop
var app = angular.module('grootDesktop',['ngRoute']);

//config routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/',
        {
            controller: "HomeController",
            templateUrl: "partials/_home.html"
        })
        .when('/join',
        {
            controller: "JoinController",
            templateUrl: "partials/_join.html"
        })
        .otherwise({ redirectTo: '/' });
})
