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
    }
}

ChatworkExtension.Background.start();