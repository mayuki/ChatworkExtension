declare var chrome: any;

module ChatworkExtension {
    export class Background {
        static start(): void {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                (sendResponse || function() {})(this[message.method].apply(this, message.arguments || []));
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
    }
}

ChatworkExtension.Background.start();