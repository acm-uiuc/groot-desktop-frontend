app.controller('AuthCtrl', function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService) {
    $scope.user = {
        netid:'',
        password:'',
    };

    $scope.login = function(user) {
        AuthService.login(user).then(function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $location.path("/intranet");
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    };
});
