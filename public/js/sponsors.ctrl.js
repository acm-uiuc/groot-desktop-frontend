/** SponsorController
    Responsible for content sponsor view
    - Allows for dynamic home page content
    - Handles resume uploads
    - Handles getting involved form
    - Handles new job posting (should we list jobs too? maybe with login?)
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('SponsorsCtrl', ['$scope', 'RESUME_SERVICE', function($scope, RESUME_SERVICE) { // mostly static - dont know if we want anything cool here later
    // contacts groot-sponsors service
    $scope.job = {
        jobType: null,
        types: [{
            name: 'Internship'
        }, {
            name: 'Co-Op'
        }, {
            name: 'Full Time'
        }],
    };

    $scope.degree = {
        degreeType: null,
        types: [{
            name: 'Bachelors'
        }, {
            name: 'Masters'
        }, {
            name: 'Ph.D'
        }],
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
            $scope.grad.years.push({
                date: dec + y
            });
            $scope.grad.years.push({
                date: may + y
            });
            y++;
        }
    } else {
        for (var i = 0; i < 4; i++) {
            $scope.grad.years.push({
                date: may + y
            });
            $scope.grad.years.push({
                date: dec + y
            });
            y++;
        }
    }

    $scope.student = {
        firstName: null,
        lastName: null,
        netid: null,
        email: null,
        gradYear: null,
        degreeType: null,
        jobType: null,
        resume: null,
    };

    $scope.uploadResume = function() {
        $scope.student.resume = $scope.resume;
        console.log($scope.resume);
        $scope.student.email = $scope.student.netid + "@illinois.edu";
        if ($scope.student.firstName === null) {
            $window.alert("Please type in your first name");
            return;
        }
        if ($scope.student.lastName === null) {
            $window.alert("Please type in your last name");
            return;
        }
        if ($scope.student.netid === null) {
            $window.alert("Please type in your netid");
            return;
        }
        if ($scope.student.degreeType === null) {
            $window.alert("Please choose a type of degree");
            return;
        }
        if ($scope.student.jobType === null) {
            $window.alert("Please choose a type of job");
            return;
        }
        if ($scope.student.gradYear === null) {
            $window.alert("Please select your graduation date");
            return;
        }
        if ($scope.student.resume === null) {
            $window.alert("Please upload a resume");
            return;
        }
        console.log($scope.student);
        return;
        // $http({
        //     method: 'POST',
        //     url: RESUME_SERVICE.url,
        //     data: $scope.student,
        //     headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        // })
        // .success(function(){
        //     console.log($scope.studnet);
        // })
        // .error(function(){
        // });
    }
}]);
