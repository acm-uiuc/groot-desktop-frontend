//Declare app grootDesktop
var app = angular.module('grootDesktop',['ngRoute']);

//config routes
//Internal and Sign in are not necessary yet but when add two controllers and routes
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: "HomeController",
            templateUrl: "partials/home.html"
        })
        .when('/about', {
            controller: "HomeController",
            templateUrl: "partials/about.html"
        })
        .when('/join', {
            controller: "JoinCtrl",
            templateUrl: "partials/join.html"
        })
        .when('/events', {
            controller: "EventsCtrl",
            templateUrl: "partials/events.html"
        })
        .when('/sigs', {
            controller: "SIGCtrl",
            templateUrl: "partials/sigs.html"
        })
        .when('/conference', {
            controller: "ConferenceCtrl",
            templateUrl: "partials/conference.html"
        })
        .when('/sponsor', {
            controller: "SponsorCtrl",
            templateUrl: "partials/sponsor.html"
        })
        .otherwise({
            redirectTo: '/'
        });
})
