/** HomeController
    Responsible for content home view
    - Allows for dynamic home page content
**/
app.controller('HomeCtrl', function ($scope){
    // mostly static - dont know if we want anything cool here later
    var showText = function(target, message, index, interval) {
        if (index < message.length) {
            $(target).append(message[index++]);
            setTimeout(function() {
                showText(target, message, index, interval);
            }, interval);
        }
    }
    $(function() {
        showText("#qualities", "echo Hello, World!", -1, 150);
    });
});
