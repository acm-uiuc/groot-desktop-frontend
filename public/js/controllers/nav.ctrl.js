/** ApplicationController
    Responsible for application level activites
    - navigation
    - header and footer
    DO NOT PUT ANY CONTENT CONTROLLING CODE HERE
**/
app.controller('NavCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.nav = [
        {name: 'About', path: '#/about'},
        {name: 'SIGs', path: '#/sigs'},
        {name: 'Events', path: '#/events'},
        {name: 'Reflections|Projections', path: '#/conference'},
        {name: 'Sponsors',path: '#/sponsors'},
        {name: 'Join', path: '#/join'}
    ];
    $scope.$watch(function(){
        $scope.login_page = $location.path() === '/login';
    });
    $scope.$watch(function(){
        $scope.authenticated = false;
    });
    console.log($scope.login_page);
}]);
