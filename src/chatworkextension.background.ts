/// <reference path="references.d.ts" />

module ChatworkExtension {
    export class Background {
        static start(): void {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                (sendResponse || function() {})(this[message.method].apply(this, message.arguments || []));
            });

            // inter-extension communication
            chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
                if (message.method == 'RegisterExternalCustomScript') {
                    (sendResponse || function () { })(Background.registerExternalCustomScript(sender.id, message.arguments[0]));
                } else {
                    console.warn('Unsupported Message: ' + message + ' (from ' + sender.id + ')');
                }
            });

            chrome.runtime.onConnectExternal.addListener((port) => {
                port.onDisconnect.addListener(() => {
                    Background.unregisterExternalCustomScript(port.sender.id);
                });
            });
        }

        static externalCustomScript: IExternalCustomScriptStorage = {};
        static getExternalCustomScripts(): IExternalCustomScriptStorage {
            return Background.externalCustomScript;
        }
        static registerExternalCustomScript(extensionId: string, body: string): void {
            console.log('Register ExternalCustomScript: ' + extensionId);
            Background.externalCustomScript[extensionId] = { body: body };
        }
        static unregisterExternalCustomScript(extensionId: string): void {
            console.log('Unregister ExternalCustomScript: ' + extensionId);
            delete Background.externalCustomScript[extensionId];
        }

        // -- ここから下は外側からメッセージ経由で呼び出されるやつ

        static readStorage(key: string): string {
            return localStorage[key];
        }

        static writeStorage(key: string, value: string): void {
            if (value == null) {
                localStorage.removeItem(key);
            } else {
                localStorage[key] = value;
            }
        }


        // レスポンスヘッダーを書き換えるマン
        static startTextResponseHeaderCharsetFilter(): void {
            chrome.webRequest.onHeadersReceived.addListener((filter) => {
                var responseHeaders = filter.responseHeaders.map(x => (x.name == "Content-Type" && x.value.match(/text\/plain/)) ? { name: "Content-Type", value: "text/plain; charset=shift_jis" } : x);
                console.log(filter);
                console.log(responseHeaders);
                return { responseHeaders: responseHeaders };
            }, {
                urls: ["*://*.s3-ap-northeast-1.amazonaws.com/*"],
                types: ["xmlhttprequest"]
            }, ["responseHeaders", "blocking"]
);
        }
    }
}

ChatworkExtension.Background.start();