app.controller('AuthCtrl', function ($scope, $http){
	$scope.login = function(){
		// console.log("Username: " + $scope.user.netid + "\tPass: " + $scope.user.password);
		$http({
			method: 'POST',
			// Ignore this, just for testing, will need to clean up when we deploy
			// url: 'http://lvh.me:8000/authentication?username=' + $scope.user.netid,
			// used lvh.me to get around CORS issue(lvh.me redirects to localhost)
			// url: 'http://127.0.0.1:8000/authentication?username=' + $scope.user.netid,
			url: '/user-auth',
			data: JSON.stringify({"user":$scope.user.netid, "pass":$scope.user.password}),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			}).then(function successCallback(response) {
				console.log("Success");
				console.log(response);
				if(response.data["Code"] == 422)
					alert("Wrong pass");
				// need to set up an error state and call it here
				else
				{
					//password ok
					console.log("good");
					$location.url("/intranet");
				}
				// this callback will be called asynchronously
				// when the response is available
			}, function errorCallback(response) {
				console.log(response);
				console.log("ERROR");
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
	};

});