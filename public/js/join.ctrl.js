/** JoinController
    Responsible for content and form handling for the join view
    - Allows students to join ACM@UIUC
    - Provides form validation for input
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('JoinCtrl', function ($scope){
    // contact groot-users service from form handler
    $scope.addMember = function () {
        console.log("Welcome " + $scope.newMember.firstName + " " + $scope.newMember.lastName + ".");
        console.log("You have NetID " + $scope.newMember.netid + " and UIN " + $scope.newMember.uin);
    }
});
