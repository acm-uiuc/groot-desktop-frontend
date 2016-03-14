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
