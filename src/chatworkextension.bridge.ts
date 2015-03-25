/// <reference path="references.d.ts" />

module ChatworkExtension.Bridge {
    export class InitializeWatcher {
        static setup(): void {
            new ValueObserver(() => (<any>window).CW && CW.init_loaded, () => InitializeWatcher.onChatworkReady());
        }

        static onChatworkReady(): void {
            window.postMessage({ sender: "ChatworkExtension.Bridge.InitializeWatcher", command: 'Ready', value: 1 }, "*");
        }
    }

    export class CWBridge {
        static setup(): void {
            window.addEventListener('message', (e) => {
                if (e.data.sender == 'ChatworkExtension.ExtensionManager' && e.data.command == 'CallCW') {
                    var result, isError;
                    try {
                        isError = false;
                        result = (<Function>CW[e.data.method]).apply(CW, e.data.arguments);
                    } catch (e) {
                        isError = true;
                        result = e.toString();
                    }
                    window.postMessage({ sender: 'ChatworkExtension.Bridge.CWBridge', result: result, caller: e.data.caller, isError: isError }, '*');
                }
            })
        }
    }

    class ValueObserver {
        _timer: number;
        _onCheck: () => boolean;
        _onComplete: () => void;

        constructor(onCheck: () => boolean, onComplete: () => void) {
            this._onCheck = onCheck;
            this._onComplete = onComplete;
            this._timer = setInterval(() => {
                if (this._onCheck()) {
                    try { this._onComplete(); } catch (e) { }
                    this.dispose();
                }
            }, 100);
        }

        dispose(): void {
            if (this._timer != null) {
                clearInterval(this._timer);
                this._timer = null;
            }
        }
    }
}

ChatworkExtension.Bridge.InitializeWatcher.setup();
ChatworkExtension.Bridge.CWBridge.setup();
