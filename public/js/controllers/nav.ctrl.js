/** ApplicationController
    Responsible for application level activites
    - navigation
    - header and footer
    DO NOT PUT ANY CONTENT CONTROLLING CODE HERE
**/
app.controller('NavCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.nav_un_auth = [
        {name: 'About', path: '#/about'},
        {name: 'SIGs', path: '#/sigs'},
        {name: 'Events', path: '#/events'},
        {name: 'Reflections|Projections', path: '#/conference'},
        {name: 'Sponsors',path: '#/sponsors'},
        {name: 'Join', path: '#/join'}
    ];
    $scope.nav_auth = [
        {name: 'About', path: '#/about'},
        {name: 'SIGs', path: '#/sigs'},
        {name: 'Events', path: '#/events'},
        {name: 'Reflections|Projections', path: '#/conference'},
        {name: 'Sponsors',path: '#/sponsors'},
        {name: 'Intranet', path: '#/intranet'}
    ];
    $scope.$watch(function(){
        $scope.login_page = $location.path() === '/login';
    });
    $scope.$watch(function(){
        $scope.authenticated = true;
    });
}]);
