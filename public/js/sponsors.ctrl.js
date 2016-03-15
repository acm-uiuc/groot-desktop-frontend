/** SponsorController
    Responsible for content sponsor view
    - Allows for dynamic home page content
    - Handles resume uploads
    - Handles getting involved form
    - Handles new job posting (should we list jobs too? maybe with login?)
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('SponsorCtrl', function ($scope){
    // mostly static - dont know if we want anything cool here later
    // contacts groot-sponsors service
    $scope.job = {
        jobType: null,
        types: [
            {name: 'Internship'},
            {name: 'Co-Op'},
            {name: 'Full Time'}
        ],
    };

    $scope.degree = {
        degreeType: null,
        types: [
            {name: 'Bachelors'},
            {name: 'Masters'},
            {name: 'Ph.D'}
        ],
    };

    $scope.grad = {
        gradYear: null,
        years: [],
    };

    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth();
    var dec = "December ";
    var may = "May "

    if (m > 6) {
        for (var i = 0; i < 4; i++) {
            $scope.grad.years.push({date: dec + y });
            $scope.grad.years.push({date: may + y});
            y++;
        }
    } else {
        for (var i = 0; i < 4; i++) {
            $scope.grad.years.push({date: may + y});
            $scope.grad.years.push({date: dec + y});
            y++;
        }
    }

    console.log($scope.grad);

    $scope.student = {
        firstName: null,
        lastName: null,
        netid: null,
        gradYear: null,
        degreeType: null,
        jobType: null,
        resume: null,
    };

});
