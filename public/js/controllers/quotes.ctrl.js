/** QuotesController
    Responsible for content home view
    - Contacts groot for list of ACM quotes
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('QuotesCtrl', function ($scope){
    $scope.quotes = []

    $scope.getItems = function() {
        $http({method : 'GET', url : 'http://localhost:8000/quotes'})
            .success(function(data, status) {
                $scope.quotes = data;
             })
            .error(function(data, status) {
                alert("status");
            });
    }
});
