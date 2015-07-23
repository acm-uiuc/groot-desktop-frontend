app.controller('ApplicationController', function ($scope) {
    $scope.nav = [
        {name: 'Home', path:'/'},
        {name: 'About', path: '/about.html'},
        {name: 'Sponsor',path: '/sponsor.html'},
        {name: 'Join', path: '/join.html'},
        {name: 'Contact',path: '/contact.html'}
    ];
});
