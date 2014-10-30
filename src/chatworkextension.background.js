var ChatworkExtension;
(function (ChatworkExtension) {
    var Background = (function () {
        function Background() {
        }
        Background.start = function () {
            var _this = this;
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                (sendResponse || function () {
                })(_this[message.method].apply(_this, message.arguments || []));
            });
        };

        Background.readStorage = function (key) {
            return localStorage[key];
        };

        Background.writeStorage = function (key, value) {
            if (value == null) {
                localStorage.removeItem(key);
            } else {
                localStorage[key] = value;
            }
        };
        return Background;
    })();
    ChatworkExtension.Background = Background;
})(ChatworkExtension || (ChatworkExtension = {}));

ChatworkExtension.Background.start();
