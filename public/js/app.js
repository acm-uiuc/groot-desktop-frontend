//Declare app grootDesktop
var app = angular.module('grootDesktop',['ngRoute']);

app.constant("RESUME_SERVICE", {
    "url": "groot/resumes",
    "port": "80"
});
app.constant("USER_SERVICE", {
    "url": "groot/users",
    "port": "80"
});

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
        .when('/sponsors', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/sponsors.html"
        })
        .when('/sponsors/resume_book', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/resume_book.html"
        })
        .otherwise({
            redirectTo: '/'
        });
})
