/// <reference path="references.d.ts" />
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
            // inter-extension communication
            chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
                if (message.method == 'RegisterExternalCustomScript') {
                    (sendResponse || function () {
                    })(Background.registerExternalCustomScript(sender.id, message.arguments[0]));
                }
                else {
                    console.warn('Unsupported Message: ' + message + ' (from ' + sender.id + ')');
                }
            });
            chrome.runtime.onConnectExternal.addListener(function (port) {
                port.onDisconnect.addListener(function () {
                    Background.unregisterExternalCustomScript(port.sender.id);
                });
            });
        };
        Background.readStorage = function (key) {
            return localStorage[key];
        };
        Background.writeStorage = function (key, value) {
            if (value == null) {
                localStorage.removeItem(key);
            }
            else {
                localStorage[key] = value;
            }
        };
        Background.getExternalCustomScripts = function () {
            return Background.externalCustomScript;
        };
        Background.registerExternalCustomScript = function (extensionId, body) {
            console.log('Register ExternalCustomScript: ' + extensionId);
            Background.externalCustomScript[extensionId] = { body: body };
        };
        Background.unregisterExternalCustomScript = function (extensionId) {
            console.log('Unregister ExternalCustomScript: ' + extensionId);
            delete Background.externalCustomScript[extensionId];
        };
        Background.externalCustomScript = {};
        return Background;
    })();
    ChatworkExtension.Background = Background;
})(ChatworkExtension || (ChatworkExtension = {}));
ChatworkExtension.Background.start();
