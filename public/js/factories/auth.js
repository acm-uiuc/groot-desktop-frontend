app.factory('AuthService', function ($http, AUTH_SERVICE, Session) {
    var authService = {};

    authService.login = function (user) {
        return $http({
            method: 'POST',
            url: `/authenticate`,
            data: JSON.stringify({"username":user.netid,
                                "password":user.password,
                                "validation-factors" : {
                                    "validationFactors" : [
                                        {
                                            "name" : "remote_address",
                                            "value" : "127.0.0.1"
                                        }
                                    ]
                                }
                            }), headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                            })
        .then(function success(response) {
            console.log("Success");
            console.log(response);
            if(response.data["Code"] == 422) {
                alert("Wrong pass");
            } else {
                Session.create(response);
            }
        }, function error(response) {
            console.log(response);
            console.log("ERROR");
        });
    };

    // authService.isAuthenticated = function () {
    //     $http({
    //         method: 'POST',
    //         url: '/user-auth',
    //         data: JSON.stringify({"user":user.netid, "pass":user.password}),
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json'
    //         },
    //     }).then(function success(response) {
    //         console.log("Success");
    //         console.log(response);
    //         if(response.data["Code"] == 422) {
    //             alert("Wrong pass");
    //         } else {
    //             //password ok
    //             Session.create(response);
    //         }
    //         // this callback will be called asynchronously
    //         // when the response is available
    //     }, function error(response) {
    //         console.log(response);
    //         console.log("ERROR");
    //     });
    //     return !!Session.token;
    // };

    authService.isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() &&
        authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
});



app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized,
        419: AUTH_EVENTS.sessionTimeout,
        440: AUTH_EVENTS.sessionTimeout
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
