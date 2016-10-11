// Declare app grootDesktop
const app = angular.module('grootDesktop', ['ui.router']);

const GROOT = 'http://localhost:8000';
app.constant('RESUME_SERVICE', {
    'url': `${GROOT}/resume`,
    'port': '80'
});
app.constant('AUTH_SERVICE', {
    'url':  `${GROOT}/authentication`,
    'port': '80'
});

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
});

app.constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  top4: 'top4',
  corporate: 'corporate',
  sigchairs: 'sig-chairs',
  member: 'member',
});

app.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
    .state('root', {
        url: "/",
        controller: "HomeCtrl",
        templateUrl: "partials/home.html",
    })
    .state('about', {
        url: '/about',
        controller: "AboutCtrl",
        templateUrl: 'partials/about.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('join', {
        url: '/join',
        controller: "JoinCtrl",
        templateUrl: 'partials/join.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('events', {
        url: '/events',
        controller: "EventsCtrl",
        templateUrl: 'partials/events.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('quotes', {
        url: '/quotes',
        controller: "QuotesCtrl",
        templateUrl: 'partials/quotes.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('sigs', {
        url: '/sigs',
        controller: "SigCtrl",
        templateUrl: 'partials/sigs.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('intranet', {
        url: '/intranet',
        controller: "IntranetCtrl",
        templateUrl: 'partials/intranet.html',
        authenticate: true,
        resolve: {
            isLogged: ['AuthService' , function(AuthService) {
                return AuthService.isAuthenticated();
            }]
        },
        data: {
            authorizedRoles: [USER_ROLES.members],
        }
    })
    .state('confernece', {
        url: '/conference',
        controller: "ConferenceCtrl",
        templateUrl: 'partials/conference.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('login', {
        url: '/login',
        controller: "AuthCtrl",
        templateUrl: 'partials/login.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('sponsors', {
        url: '/sponsors',
        controller: "SponsorsCtrl",
        templateUrl: 'partials/sponsors.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('resume_book', {
        url: '/sponsors/resume_book',
        controller: "SponsorsCtrl",
        templateUrl: 'partials/resume_book.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('recruiting', {
        url: '/sponsors/recruiting',
        controller: "SponsorsCtrl",
        templateUrl: 'partials/recruiting.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('recruiter_login', {
        url: '/sponsors/recruiter_login',
        controller: "SponsorsCtrl",
        templateUrl: 'partials/recruiter_login.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    })
    .state('new_job_post', {
        url: '/sponsors/new_job_post',
        controller: "SponsorsCtrl",
        templateUrl: 'partials/new_job_post.html',
        data: {
            authorizedRoles: [USER_ROLES.all],
        }
    });
});

app.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function ($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
});

app.controller('ApplicationController', function ($scope, USER_ROLES, AuthService) {
  $scope.currentUser = null;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;

  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };
})
