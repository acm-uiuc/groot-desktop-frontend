app.controller('IntranetCtrl', ['$scope', '$http', 'USER_SERVICE', function ($scope, $http, USER_SERVICE){
    // Simple GET request example:
    $scope.netid = 'sivagna2';
    console.log(USER_SERVICE.url+'/'+$scope.netid);
    $http.get(USER_SERVICE.url+'/'+$scope.netid).then(function(response){ console.log(response); });
}]);
