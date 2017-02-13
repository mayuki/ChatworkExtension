/// <reference path="references.d.ts" />
var ChatworkExtension;
(function (ChatworkExtension) {
    var Background = (function () {
        function Background() {
        }
        Background.start = function () {
            var _this = this;
            chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
                (sendResponse || function () { })(_this[message.method].apply(_this, message.arguments || []));
            });
            // inter-extension communication
            chrome.runtime.onMessageExternal.addListener(function (message, sender, sendResponse) {
                if (message.method == 'RegisterExternalCustomScript') {
                    (sendResponse || function () { })(Background.registerExternalCustomScript(sender.id, message.arguments[0]));
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
        // -- ここから下は外側からメッセージ経由で呼び出されるやつ
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
        // レスポンスヘッダーを書き換えるマン
        Background.startTextResponseHeaderCharsetFilter = function () {
            chrome.webRequest.onHeadersReceived.addListener(function (filter) {
                var responseHeaders = filter.responseHeaders.map(function (x) { return (x.name == "Content-Type" && x.value.match(/text\/plain/)) ? { name: "Content-Type", value: "text/plain; charset=shift_jis" } : x; });
                console.log(filter);
                console.log(responseHeaders);
                return { responseHeaders: responseHeaders };
            }, {
                urls: ["*://*.s3-ap-northeast-1.amazonaws.com/*"],
                types: ["xmlhttprequest"]
            }, ["responseHeaders", "blocking"]);
        };
        return Background;
    }());
    Background.externalCustomScript = {};
    ChatworkExtension.Background = Background;
})(ChatworkExtension || (ChatworkExtension = {}));
ChatworkExtension.Background.start();
