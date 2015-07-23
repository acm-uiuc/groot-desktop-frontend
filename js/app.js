//Declare app grootDesktop
var app = angular.module('grootDesktop',['ngRoute']);

//config routes
//Internal and Sign in are not necessary yet but when add two controllers and routes 
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
        .when('/events',
        {
            controller: "EventsController",
            templateUrl: "partials/_events.html"
        })
        .when('/sigs',
        {
            controller: "SIGController",
            templateUrl: "partials/_sig.html"
        })
        .when('/confrence',
        {
            controller: "HomeController",
            templateUrl: "partials/_conference.html"
        })
        .when('/sponsor',
        {
            controller: "sponsorController",
            templateUrl: "partials/_sponsor.html"
        })
        .otherwise({ redirectTo: '/' });
})
