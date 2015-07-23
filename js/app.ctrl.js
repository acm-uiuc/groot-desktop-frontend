/** ApplicationController
    Responsible for application level activites
    - navigation
    - header and footer
    DO NOT PUT ANY CONTENT CONTROLLING CODE HERE
**/
app.controller('ApplicationController', function ($scope) {
    $scope.nav = [
        {name: 'Home', path:'/'},
        {name: 'About', path: '/about.html'},
        {name: 'Sponsor',path: '/sponsor.html'},
        {name: 'Join', path: '/join.html'},
        {name: 'Contact',path: '/contact.html'}
    ];
});
