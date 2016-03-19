/** HomeController
    Responsible for content home view
    - Allows for dynamic home page content
**/
app.controller('HomeCtrl', function ($scope){
    // mostly static - dont know if we want anything cool here later
    $scope.message_str = "echo Hello, World!"

    var showText = function(target, message, index, interval) {
        if (index < message.length) {
            $(target).append(message[index++]);
            setTimeout(function() {
                showText(target, message, index, interval);
            }, interval);
        }
    }
    $(function() {
        showText("#qualities", $scope.message_str, -1, 150);
    });
});
