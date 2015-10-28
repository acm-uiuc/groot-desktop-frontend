//Declare app grootDesktop
var app = angular.module('grootDesktop',['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: "HomeCtrl",
            templateUrl: "partials/home.html"
        })
        .when('/about', {
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
