//Declare app grootDesktop
var app = angular.module('grootDesktop',['ngRoute']);

const GROOT = 'http://localhost:8000';
app.constant('RESUME_SERVICE', {
    'url':  GROOT+'/resumes',
    'port': '80'
});
app.constant('USER_SERVICE', {
    'url':  GROOT+'/users',
    'port': '80'
});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: "HomeCtrl",
            templateUrl: "partials/home.html"
        })
        .when('/about', {
            controller: "AboutCtrl",
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
        .when('/intranet', {
            controller: "IntranetCtrl",
            templateUrl: "partials/intranet.html"
        })
        .when('/conference', {
            controller: "ConferenceCtrl",
            templateUrl: "partials/conference.html"
        })
        .when('/sponsors', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/sponsors.html"
        })
        .when('/login', {
            controller: "AuthCtrl",
            templateUrl: "partials/login.html"
        })
        .when('/sponsors/resume_book', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/resume_book.html"
        })
        .when('/sponsors/recruiting', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/recruiting.html"
        })
        .when('/sponsors/recruiter_login', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/recruiter_login.html"
        })
        .when('/sponsors/new_job_post', {
            controller: "SponsorsCtrl",
            templateUrl: "partials/new_job_post.html"
        })
        .otherwise({
            redirectTo: '/'
        });
})
